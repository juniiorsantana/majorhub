import type { CategoryResult, CheckItem, DiagnosticoResultado, Faixa, SiteAudit } from './types'

const WEIGHTS: Record<CategoryResult['id'], number> = {
  desempenho: 0.3,
  seo: 0.25,
  ia: 0.25,
  presenca: 0.2,
}

export function faixaDaNota(nota: number): Faixa {
  if (nota <= 40) return 'critico'
  if (nota <= 65) return 'regular'
  if (nota <= 84) return 'bom'
  return 'otimo'
}

function notaDosChecks(checks: CheckItem[]): number {
  if (checks.length === 0) return 0
  const passed = checks.filter(c => c.passed).length
  return Math.round((passed / checks.length) * 100)
}

function buildDesempenho(audit: SiteAudit): CategoryResult {
  const checks: CheckItem[] = [
    {
      label: 'Servidor responde rápido',
      passed: audit.responseTimeMs > 0 && audit.responseTimeMs <= 1500,
      detail: `Tempo de resposta: ${(audit.responseTimeMs / 1000).toFixed(1)}s`,
    },
    {
      label: 'Página com peso saudável',
      passed: audit.htmlKb > 0 && audit.htmlKb <= 400,
      detail: `Tamanho do HTML: ${audit.htmlKb} KB`,
    },
    {
      label: 'Quantidade equilibrada de scripts externos',
      passed: audit.scriptCount <= 20,
      detail: `${audit.scriptCount} scripts externos carregados`,
    },
    {
      label: 'Volume de imagens sob controle',
      passed: audit.imagesTotal <= 60,
      detail: `${audit.imagesTotal} imagens na página`,
    },
  ]

  const nota = notaDosChecks(checks)
  return { id: 'desempenho', nome: 'Desempenho', nota, faixa: faixaDaNota(nota), disponivel: true, checks }
}

function buildSeo(audit: SiteAudit): CategoryResult {
  const checks: CheckItem[] = [
    {
      label: 'Título da página presente e com tamanho adequado',
      passed: !!audit.title && audit.titleLength >= 10 && audit.titleLength <= 70,
      detail: audit.title ? `Título encontrado: "${audit.title}"` : 'Nenhum título encontrado',
    },
    {
      label: 'Meta description presente (resumo que aparece no Google)',
      passed: !!audit.metaDescription,
    },
    {
      label: 'Apenas um H1 na página',
      passed: audit.h1Count === 1,
      detail: audit.h1Count === 0 ? 'Nenhum H1 encontrado' : audit.h1Count > 1 ? `${audit.h1Count} H1s encontrados` : undefined,
    },
    {
      label: 'Imagens com texto alternativo (alt)',
      passed: audit.imagesTotal === 0 || audit.imagesSemAlt === 0,
      detail: audit.imagesTotal > 0 ? `${audit.imagesSemAlt} de ${audit.imagesTotal} imagens sem alt` : undefined,
    },
    {
      label: 'Sitemap.xml acessível',
      passed: audit.sitemapExists,
    },
    {
      label: 'Dados estruturados de negócio (Organization/LocalBusiness)',
      passed: audit.hasOrganizationOrLocalBusiness,
    },
    {
      label: 'Tag canonical presente',
      passed: !!audit.canonical,
    },
  ]

  const nota = notaDosChecks(checks)
  return { id: 'seo', nome: 'SEO & Conteúdo', nota, faixa: faixaDaNota(nota), disponivel: true, checks }
}

function buildIa(audit: SiteAudit): CategoryResult {
  const checks: CheckItem[] = [
    {
      label: 'IAs conseguem acessar seu site (robots.txt não bloqueia)',
      passed: !audit.robots.blocksAiCrawlers,
      detail: audit.robots.blocksAiCrawlers
        ? `Bloqueando: ${audit.robots.blockedBots.join(', ')}`
        : undefined,
    },
    {
      label: 'Informação estruturada dizendo à IA quem é sua empresa',
      passed: audit.hasOrganizationOrLocalBusiness,
    },
    {
      label: 'Perguntas frequentes estruturadas (ajudam respostas de IA)',
      passed: audit.hasFaqPage,
    },
    {
      label: 'Conteúdo legível sem depender de JavaScript',
      passed: audit.textToHtmlRatio >= 0.05,
    },
    {
      label: 'Arquivo llms.txt (padrão novo para IA encontrar sua empresa)',
      passed: audit.llmsTxtExists,
    },
  ]

  const nota = notaDosChecks(checks)
  return { id: 'ia', nome: 'Visibilidade para IA', nota, faixa: faixaDaNota(nota), disponivel: true, checks }
}

function buildPresenca(audit: SiteAudit): CategoryResult {
  const checks: CheckItem[] = [
    { label: 'Conexão segura (HTTPS)', passed: audit.httpsAtivo },
    { label: 'Site adaptado para celular', passed: audit.viewportMeta },
    {
      label: 'Compartilhamento em redes sociais com título/imagem (Open Graph)',
      passed: !!(audit.ogTitle && audit.ogDescription && audit.ogImage),
    },
    { label: 'Ícone do site (favicon)', passed: audit.favicon },
    { label: 'Links para redes sociais no site', passed: audit.socialLinksCount > 0 },
  ]

  const nota = notaDosChecks(checks)
  return { id: 'presenca', nome: 'Presença Digital', nota, faixa: faixaDaNota(nota), disponivel: true, checks }
}

export function montarResultado(rawUrl: string, audit: SiteAudit): DiagnosticoResultado {
  const categorias = [buildDesempenho(audit), buildSeo(audit), buildIa(audit), buildPresenca(audit)]

  const disponiveis = categorias.filter(c => c.disponivel)
  const pesoTotal = disponiveis.reduce((sum, c) => sum + WEIGHTS[c.id], 0)
  const notaGeral = pesoTotal > 0
    ? Math.round(disponiveis.reduce((sum, c) => sum + c.nota * WEIGHTS[c.id], 0) / pesoTotal)
    : 0

  let dominio = rawUrl
  try {
    dominio = new URL(audit.finalUrl || rawUrl).hostname.replace(/^www\./, '')
  } catch {
    // mantém rawUrl como fallback
  }

  return {
    url: audit.finalUrl || rawUrl,
    dominio,
    notaGeral,
    faixaGeral: faixaDaNota(notaGeral),
    categorias,
    geradoEm: new Date().toISOString(),
  }
}
