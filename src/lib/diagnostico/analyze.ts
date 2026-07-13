import * as cheerio from 'cheerio'
import type { RobotsAnalise, SiteAudit } from './types'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': USER_AGENT,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
  'Upgrade-Insecure-Requests': '1',
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

/**
 * Sites reais falham por muitos motivos (SSL só no www, sem https, WAF).
 * Tenta variações da URL em sequência até uma responder com HTML.
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

  let lastStatus: number | undefined
  for (const candidate of candidates) {
    const start = Date.now()
    try {
      const res = await fetchWithTimeout(candidate, 15000)
      const responseTimeMs = Date.now() - start
      lastStatus = res.status
      if (!res.ok) continue
      const text = await res.text()
      if (!text) continue
      return { ok: true, status: res.status, text, finalUrl: res.url || candidate, responseTimeMs }
    } catch {
      continue
    }
  }

  return { ok: false, status: lastStatus, finalUrl: candidates[0], responseTimeMs: 0 }
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
  try {
    new URL(normalizeUrl(rawUrl))
  } catch {
    return emptyAudit('URL inválida')
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

  const [robotsResult, sitemapResult, llmsResult] = await Promise.all([
    fetchTextSafe(`${origin}/robots.txt`, 6000),
    fetchTextSafe(`${origin}/sitemap.xml`, 6000),
    fetchTextSafe(`${origin}/llms.txt`, 6000),
  ])

  const html = htmlResult.text
  const $ = cheerio.load(html)

  const title = $('title').first().text().trim() || undefined
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || undefined
  const h1Count = $('h1').length
  const images = $('img')
  const imagesTotal = images.length
  const imagesSemAlt = images.filter((_, el) => !$(el).attr('alt')?.trim()).length
  const canonical = $('link[rel="canonical"]').attr('href') || undefined
  const viewportMeta = $('meta[name="viewport"]').length > 0
  const ogTitle = $('meta[property="og:title"]').attr('content') || undefined
  const ogDescription = $('meta[property="og:description"]').attr('content') || undefined
  const ogImage = $('meta[property="og:image"]').attr('content') || undefined
  const favicon = $('link[rel="icon"], link[rel="shortcut icon"]').length > 0

  let hasOrganizationOrLocalBusiness = false
  let hasFaqPage = false
  $('script[type="application/ld+json"]').each((_, el) => {
    const content = $(el).contents().text()
    if (/"@type"\s*:\s*"(Organization|LocalBusiness)"/i.test(content)) hasOrganizationOrLocalBusiness = true
    if (/"@type"\s*:\s*"FAQPage"/i.test(content)) hasFaqPage = true
  })

  const socialDomains = ['instagram.com', 'facebook.com', 'linkedin.com', 'wa.me', 'whatsapp.com', 'tiktok.com']
  const socialLinksCount = $('a[href]')
    .filter((_, el) => socialDomains.some(d => ($(el).attr('href') || '').includes(d)))
    .length

  const bodyText = $('body').clone().find('script,style,noscript').remove().end().text().replace(/\s+/g, ' ').trim()
  const textToHtmlRatio = html.length > 0 ? bodyText.length / html.length : 0

  return {
    fetchOk: true,
    finalUrl: url,
    httpsAtivo: url.startsWith('https://'),
    statusCode: htmlResult.status,
    responseTimeMs: htmlResult.responseTimeMs,
    htmlKb: Math.round(html.length / 1024),
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
    hasFaqPage,
    socialLinksCount,
    textToHtmlRatio,
    robots: robotsResult.ok && robotsResult.text
      ? parseRobots(robotsResult.text)
      : { fetched: false, blocksAiCrawlers: false, blockedBots: [], disallowsAll: false },
    sitemapExists: sitemapResult.ok,
    llmsTxtExists: llmsResult.ok,
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
    hasFaqPage: false,
    socialLinksCount: 0,
    textToHtmlRatio: 0,
    robots: { fetched: false, blocksAiCrawlers: false, blockedBots: [], disallowsAll: false },
    sitemapExists: false,
    llmsTxtExists: false,
  }
}
