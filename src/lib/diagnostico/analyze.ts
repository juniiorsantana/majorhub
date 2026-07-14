import * as cheerio from 'cheerio'
import { lookup } from 'node:dns/promises'
import type { RobotsAnalise, SiteAudit } from './types'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': USER_AGENT,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
  'Upgrade-Insecure-Requests': '1',
}

// Tipos claramente não relacionados a uma entidade de negócio (evita falso positivo
// quando um node qualquer, ex: um autor de artigo, tem campo "address")
const NON_BUSINESS_TYPES = /^(WebSite|WebPage|CollectionPage|ItemPage|SearchAction|BreadcrumbList|ItemList|ListItem|Article|BlogPosting|NewsArticle|ImageObject|VideoObject|Product|Offer|Review|AggregateRating|Person|Question|Answer|ContactPoint|PostalAddress|GeoCoordinates|OpeningHoursSpecification|City|State|Country|Place|Event)$/i

const BUSINESS_SIGNAL_FIELDS = ['address', 'telephone', 'openingHours', 'openingHoursSpecification', 'priceRange', 'areaServed', 'geo']

interface JsonLdTypeHit {
  types: string[]
  node: Record<string, unknown>
}

/** Percorre recursivamente um documento JSON-LD (inclui @graph, arrays e nós aninhados) coletando todo "@type" encontrado */
function collectJsonLdTypeHits(value: unknown, hits: JsonLdTypeHit[] = []): JsonLdTypeHit[] {
  if (Array.isArray(value)) {
    for (const item of value) collectJsonLdTypeHits(item, hits)
  } else if (value && typeof value === 'object') {
    const node = value as Record<string, unknown>
    const raw = node['@type']
    if (raw !== undefined) {
      const types = (Array.isArray(raw) ? raw : [raw]).filter((t): t is string => typeof t === 'string')
      if (types.length > 0) hits.push({ types, node })
    }
    for (const key of Object.keys(node)) {
      if (key === '@type') continue
      collectJsonLdTypeHits(node[key], hits)
    }
  }
  return hits
}

/**
 * Considera "negócio" tanto Organization/LocalBusiness quanto qualquer subtipo mais
 * específico do Schema.org (Physician, Dentist, Restaurant, Store, ProfessionalService...)
 * — identificados por carregarem sinais típicos de negócio (endereço, telefone, área de atendimento).
 */
function isBusinessTypeHit({ types, node }: JsonLdTypeHit): boolean {
  if (types.some(t => /organization|localbusiness/i.test(t))) return true
  const looksGeneric = types.every(t => NON_BUSINESS_TYPES.test(t))
  if (looksGeneric) return false
  return BUSINESS_SIGNAL_FIELDS.some(field => node[field] != null)
}

const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'Google-Extended',
  'PerplexityBot',
  'CCBot',
  'Applebot-Extended',
  'Bytespider',
]

export function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`
  return trimmed
}

// ─── Proteção SSRF: a API busca URLs fornecidas pelo usuário ───

function isPrivateIp(ip: string): boolean {
  if (ip.includes(':')) {
    // IPv6: loopback, link-local, unique-local e IPv4 mapeado
    const lower = ip.toLowerCase()
    if (lower === '::1' || lower === '::') return true
    if (lower.startsWith('fe80') || lower.startsWith('fc') || lower.startsWith('fd')) return true
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    return mapped ? isPrivateIp(mapped[1]) : false
  }
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(n => Number.isNaN(n))) return true
  const [a, b] = parts
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  )
}

/** Bloqueia localhost, hosts internos e IPs privados (checa também a resolução DNS) */
async function isHostAllowed(hostname: string): Promise<boolean> {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  if (host === 'localhost' || host.endsWith('.localhost')) return false
  if (host.endsWith('.local') || host.endsWith('.internal')) return false
  if (/^[\d.]+$/.test(host) || host.includes(':')) return !isPrivateIp(host)
  if (!host.includes('.')) return false
  try {
    const addresses = await lookup(host, { all: true })
    return addresses.every(addr => !isPrivateIp(addr.address))
  } catch {
    // DNS não resolveu: o fetch vai falhar sozinho com o erro natural
    return true
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: BROWSER_HEADERS,
    })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchTextSafe(url: string, timeoutMs: number): Promise<{ ok: boolean; status?: number; text?: string }> {
  try {
    const res = await fetchWithTimeout(url, timeoutMs)
    if (!res.ok) return { ok: false, status: res.status }
    return { ok: true, status: res.status, text: await res.text() }
  } catch {
    return { ok: false }
  }
}

interface HtmlFetchResult {
  ok: boolean
  status?: number
  text?: string
  finalUrl: string
  responseTimeMs: number
}

// Orçamento total de busca do HTML: mantém a análise dentro do limite da função serverless
const HTML_FETCH_BUDGET_MS = 12000
const PER_CANDIDATE_TIMEOUT_MS = 8000

/**
 * Sites reais falham por muitos motivos (SSL só no www, sem https, WAF).
 * Tenta variações da URL em sequência até uma responder com HTML,
 * respeitando um orçamento de tempo global.
 */
async function fetchHtmlResilient(rawUrl: string): Promise<HtmlFetchResult> {
  const url = new URL(normalizeUrl(rawUrl))
  const host = url.hostname
  const altHost = host.startsWith('www.') ? host.replace(/^www\./, '') : `www.${host}`
  const path = `${url.pathname}${url.search}`

  const candidates = [
    `https://${host}${path}`,
    `https://${altHost}${path}`,
    `http://${host}${path}`,
    `http://${altHost}${path}`,
  ]

  const deadline = Date.now() + HTML_FETCH_BUDGET_MS
  let lastStatus: number | undefined
  for (const candidate of candidates) {
    const remaining = deadline - Date.now()
    if (remaining <= 0) break
    const start = Date.now()
    try {
      const res = await fetchWithTimeout(candidate, Math.min(PER_CANDIDATE_TIMEOUT_MS, remaining))
      const responseTimeMs = Date.now() - start
      lastStatus = res.status
      if (!res.ok) continue

      // Redirect pode levar pra host interno: valida o destino final (sem custo de DNS extra)
      const finalHost = new URL(res.url || candidate).hostname.toLowerCase()
      if (finalHost === 'localhost' || (/^[\d.:]+$/.test(finalHost) && isPrivateIp(finalHost))) continue

      const text = await res.text()
      if (!text) continue
      return { ok: true, status: res.status, text, finalUrl: res.url || candidate, responseTimeMs }
    } catch {
      continue
    }
  }

  return { ok: false, status: lastStatus, finalUrl: candidates[0], responseTimeMs: 0 }
}

// ─── Validação de conteúdo: status 200 não prova que o arquivo existe ───
// (hospedagens SPA respondem 200 com o HTML do index pra qualquer caminho)

function looksLikeHtml(text: string): boolean {
  return /^\s*(<!doctype\s|<html[\s>])/i.test(text) || /<html[\s>]/i.test(text.slice(0, 2000))
}

function isValidSitemap(text: string): boolean {
  return /<(urlset|sitemapindex)[\s>]/i.test(text.slice(0, 5000))
}

function isValidLlmsTxt(text: string): boolean {
  return text.trim().length > 0 && !looksLikeHtml(text)
}

/** Extrai URLs declaradas em linhas "Sitemap:" do robots.txt */
function sitemapsFromRobots(content: string): string[] {
  const urls: string[] = []
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*sitemap\s*:\s*(\S+)/i)
    if (match) urls.push(match[1])
  }
  return urls
}

function parseRobots(content: string): RobotsAnalise {
  const lines = content.split(/\r?\n/).map(l => l.trim())
  const blocks: { agents: string[]; disallow: string[] }[] = []
  let current: { agents: string[]; disallow: string[] } | null = null

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue
    const sepIndex = line.indexOf(':')
    if (sepIndex === -1) continue
    const key = line.slice(0, sepIndex).trim().toLowerCase()
    const value = line.slice(sepIndex + 1).trim()

    if (key === 'user-agent') {
      if (!current || current.disallow.length > 0) {
        current = { agents: [value], disallow: [] }
        blocks.push(current)
      } else {
        current.agents.push(value)
      }
    } else if (key === 'disallow' && current) {
      current.disallow.push(value)
    }
  }

  const findBlockFor = (bot: string) =>
    blocks.find(b => b.agents.some(a => a.toLowerCase() === bot.toLowerCase()))

  const wildcardBlock = blocks.find(b => b.agents.includes('*'))
  const wildcardDisallowsAll = !!wildcardBlock?.disallow.some(d => d === '/')

  const blockedBots: string[] = []
  for (const bot of AI_BOTS) {
    const block = findBlockFor(bot)
    if (block) {
      if (block.disallow.some(d => d === '/')) blockedBots.push(bot)
    } else if (wildcardDisallowsAll) {
      blockedBots.push(bot)
    }
  }

  return {
    fetched: true,
    blocksAiCrawlers: blockedBots.length > 0,
    blockedBots,
    disallowsAll: wildcardDisallowsAll,
  }
}

export async function analyzeSite(rawUrl: string): Promise<SiteAudit> {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(normalizeUrl(rawUrl))
  } catch {
    return emptyAudit('URL inválida')
  }

  if (!(await isHostAllowed(parsedUrl.hostname))) {
    return emptyAudit('Esse endereço não pode ser analisado. Informe o site público da sua empresa.')
  }

  const htmlResult = await fetchHtmlResilient(rawUrl)
  if (!htmlResult.ok || !htmlResult.text) {
    return emptyAudit(
      htmlResult.status
        ? `O site respondeu com erro (código ${htmlResult.status}). Verifique se o endereço está correto.`
        : 'Não foi possível acessar o site. Verifique se o endereço está correto e se o site está no ar.'
    )
  }

  const url = htmlResult.finalUrl
  const origin = new URL(url).origin

  const [robotsResult, sitemapResult, llmsResult, faviconResult] = await Promise.all([
    fetchTextSafe(`${origin}/robots.txt`, 5000),
    fetchTextSafe(`${origin}/sitemap.xml`, 5000),
    fetchTextSafe(`${origin}/llms.txt`, 5000),
    fetchTextSafe(`${origin}/favicon.ico`, 5000),
  ])

  // Status 200 não basta: valida o conteúdo de cada arquivo
  const robotsText = robotsResult.ok && robotsResult.text && !looksLikeHtml(robotsResult.text)
    ? robotsResult.text
    : undefined

  let sitemapExists = !!(sitemapResult.ok && sitemapResult.text && isValidSitemap(sitemapResult.text))
  if (!sitemapExists && robotsText) {
    // WordPress/Yoast costuma declarar o sitemap no robots.txt em outro caminho
    const declared = sitemapsFromRobots(robotsText)[0]
    if (declared) {
      const declaredResult = await fetchTextSafe(declared, 5000)
      sitemapExists = !!(declaredResult.ok && declaredResult.text && isValidSitemap(declaredResult.text))
    }
  }

  const llmsTxtExists = !!(llmsResult.ok && llmsResult.text && isValidLlmsTxt(llmsResult.text))

  const html = htmlResult.text
  const $ = cheerio.load(html)

  const title = $('title').first().text().trim() || undefined
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || undefined
  const h1Count = $('h1').length
  const images = $('img')
  const imagesTotal = images.length
  // alt="" (vazio) é válido: marca imagem decorativa. Só conta como erro a ausência do atributo
  const imagesSemAlt = images.filter((_, el) => $(el).attr('alt') === undefined).length
  const canonical = $('link[rel="canonical"]').attr('href') || undefined
  const viewportMeta = $('meta[name="viewport"]').length > 0
  const ogTitle = $('meta[property="og:title"]').attr('content') || undefined
  const ogDescription = $('meta[property="og:description"]').attr('content') || undefined
  const ogImage = $('meta[property="og:image"]').attr('content') || undefined
  // Aceita qualquer rel contendo "icon" (icon, shortcut icon, apple-touch-icon) e,
  // sem a tag, a convenção /favicon.ico na raiz (validando que não é fallback de SPA)
  const faviconLinkTag = $('link[rel*="icon" i]').length > 0
  const faviconIcoExists = !!(faviconResult.ok && faviconResult.text && !looksLikeHtml(faviconResult.text))
  const favicon = faviconLinkTag || faviconIcoExists

  let hasOrganizationOrLocalBusiness = false
  let hasFaqPage = false
  const businessSchemaTypes: string[] = []

  $('script[type="application/ld+json"]').each((_, el) => {
    const content = $(el).contents().text()

    let parsed: unknown
    try {
      parsed = JSON.parse(content)
    } catch {
      // JSON-LD malformado: cai pro fallback textual abaixo em vez de descartar o sinal
      if (/"@type"\s*:\s*"(Organization|LocalBusiness)"/i.test(content)) hasOrganizationOrLocalBusiness = true
      if (/"@type"\s*:\s*"FAQPage"/i.test(content)) hasFaqPage = true
      return
    }

    for (const hit of collectJsonLdTypeHits(parsed)) {
      if (isBusinessTypeHit(hit)) {
        hasOrganizationOrLocalBusiness = true
        for (const t of hit.types) if (!businessSchemaTypes.includes(t)) businessSchemaTypes.push(t)
      }
      if (hit.types.some(t => /^FAQPage$/i.test(t))) hasFaqPage = true
    }
  })

  // Microdata (itemtype no HTML) — formato mais antigo, ainda comum em plugins
  $('[itemtype]').each((_, el) => {
    const itemtype = $(el).attr('itemtype') || ''
    const typeName = itemtype.match(/schema\.org\/(\w+)/i)?.[1]
    if (!typeName) return
    if (/organization|localbusiness/i.test(typeName)) {
      hasOrganizationOrLocalBusiness = true
      if (!businessSchemaTypes.includes(typeName)) businessSchemaTypes.push(typeName)
    }
    if (/^FAQPage$/i.test(typeName)) hasFaqPage = true
  })

  const socialDomains = ['instagram.com', 'facebook.com', 'linkedin.com', 'wa.me', 'whatsapp.com', 'tiktok.com']
  const socialLinksCount = $('a[href]')
    .filter((_, el) => {
      const href = $(el).attr('href') || ''
      // Botões de "compartilhar" não são presença da marca nas redes
      if (/sharer|\/share\b|intent\/tweet/i.test(href)) return false
      return socialDomains.some(d => href.includes(d))
    })
    .length

  const bodyText = $('body').clone().find('script,style,noscript').remove().end().text().replace(/\s+/g, ' ').trim()
  const textToHtmlRatio = html.length > 0 ? bodyText.length / html.length : 0

  // Seção de FAQ visível no texto (mesmo sem marcação FAQPage) — muda a mensagem do relatório
  const hasFaqText = /perguntas?\s+frequentes|d[úu]vidas\s+frequentes|\bfaq\b/i.test(bodyText)

  return {
    fetchOk: true,
    finalUrl: url,
    httpsAtivo: url.startsWith('https://'),
    statusCode: htmlResult.status,
    responseTimeMs: htmlResult.responseTimeMs,
    htmlKb: Math.round(Buffer.byteLength(html, 'utf8') / 1024),
    scriptCount: $('script[src]').length,
    title,
    titleLength: title?.length ?? 0,
    metaDescription,
    h1Count,
    imagesTotal,
    imagesSemAlt,
    canonical,
    viewportMeta,
    ogTitle,
    ogDescription,
    ogImage,
    favicon,
    hasOrganizationOrLocalBusiness,
    businessSchemaTypes,
    hasFaqPage,
    hasFaqText,
    socialLinksCount,
    textToHtmlRatio,
    robots: robotsText
      ? parseRobots(robotsText)
      : { fetched: false, blocksAiCrawlers: false, blockedBots: [], disallowsAll: false },
    sitemapExists,
    llmsTxtExists,
  }
}

function emptyAudit(erro: string): SiteAudit {
  return {
    fetchOk: false,
    erro,
    finalUrl: '',
    httpsAtivo: false,
    responseTimeMs: 0,
    htmlKb: 0,
    scriptCount: 0,
    titleLength: 0,
    h1Count: 0,
    imagesTotal: 0,
    imagesSemAlt: 0,
    viewportMeta: false,
    favicon: false,
    hasOrganizationOrLocalBusiness: false,
    businessSchemaTypes: [],
    hasFaqPage: false,
    hasFaqText: false,
    socialLinksCount: 0,
    textToHtmlRatio: 0,
    robots: { fetched: false, blocksAiCrawlers: false, blockedBots: [], disallowsAll: false },
    sitemapExists: false,
    llmsTxtExists: false,
  }
}
