import type { Banda, CategoryResult, CheckItem, DiagnosticoResultado, Faixa, SiteAudit } from './types'

// Visibilidade para IA é o coração do diagnóstico: pesa mais que as demais categorias
const WEIGHTS: Record<CategoryResult['id'], number> = {
  desempenho: 0.2,
  seo: 0.25,
  ia: 0.4,
  presenca: 0.15,
}

// Limites alinhados às bandas de direção: regular termina em 60 e ótimo começa em 86,
// pra o selo do gauge nunca contradizer a frase da banda
export function faixaDaNota(nota: number): Faixa {
  if (nota <= 40) return 'critico'
  if (nota <= 60) return 'regular'
  if (nota <= 85) return 'bom'
  return 'otimo'
}

export function bandaDaNota(nota: number): Banda {
  if (nota <= 20) return '0-20'
  if (nota <= 40) return '21-40'
  if (nota <= 50) return '41-50'
  if (nota <= 60) return '51-60'
  if (nota <= 75) return '61-75'
  if (nota <= 85) return '76-85'
  return '86-100'
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
      dica: 'Otimize o servidor ou use hospedagem com CDN pra responder em menos de 1,5s.',
    },
    {
      label: 'Página com peso saudável',
      passed: audit.htmlKb > 0 && audit.htmlKb <= 400,
      detail: `Tamanho do HTML: ${audit.htmlKb} KB`,
      dica: 'Reduza o peso da página comprimindo o código e adiando o que não é essencial.',
    },
    {
      label: 'Quantidade equilibrada de scripts externos',
      passed: audit.scriptCount <= 20,
      detail: `${audit.scriptCount} scripts externos carregados`,
      dica: 'Remova scripts de terceiros que você não usa — cada um atrasa o carregamento.',
    },
    {
      label: 'Volume de imagens sob controle',
      passed: audit.imagesTotal <= 60,
      detail: `${audit.imagesTotal} imagens na página`,
      dica: 'Comprima as imagens e carregue sob demanda (lazy loading).',
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
      dica: 'Escreva um título de 10 a 70 caracteres dizendo o que você faz e pra quem.',
    },
    {
      label: 'Meta description presente (resumo que aparece no Google)',
      passed: !!audit.metaDescription,
      dica: 'Adicione uma meta description: é o resumo que convence o clique no Google.',
    },
    {
      label: 'Apenas um H1 na página',
      passed: audit.h1Count === 1,
      detail: audit.h1Count === 0 ? 'Nenhum H1 encontrado' : audit.h1Count > 1 ? `${audit.h1Count} H1s encontrados` : undefined,
      dica: 'Use exatamente um H1 por página, com a sua principal palavra-chave.',
    },
    {
      label: 'Imagens com texto alternativo (alt)',
      passed: audit.imagesTotal === 0 || audit.imagesSemAlt === 0,
      detail: audit.imagesTotal > 0 ? `${audit.imagesSemAlt} de ${audit.imagesTotal} imagens sem alt` : undefined,
      dica: 'Descreva cada imagem no atributo alt — Google e IA "leem" imagens por ele.',
    },
    {
      label: 'Sitemap.xml acessível',
      passed: audit.sitemapExists,
      dica: 'Publique um sitemap.xml pra facilitar a indexação de todas as páginas.',
    },
    {
      label: 'Dados estruturados de negócio (Schema.org: Organization, LocalBusiness ou tipo específico)',
      passed: audit.hasOrganizationOrLocalBusiness,
      detail: audit.hasOrganizationOrLocalBusiness
        ? `Encontrado: ${audit.businessSchemaTypes.join(', ')}`
        : 'Nenhuma marcação Schema.org de negócio encontrada na página',
      dica: 'Adicione marcação Schema.org (Organization, LocalBusiness ou um tipo mais específico do seu negócio) dizendo quem é sua empresa.',
    },
    {
      label: 'Tag canonical presente',
      passed: !!audit.canonical,
      dica: 'Adicione a tag canonical pra evitar conteúdo duplicado aos olhos do Google.',
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
        : audit.robots.fetched
          ? 'robots.txt permite o acesso dos robôs de IA'
          : 'robots.txt não encontrado — acesso liberado por padrão',
      dica: 'Libere os robôs de IA no robots.txt — bloqueado, você não existe pra elas.',
    },
    {
      label: 'Informação estruturada dizendo à IA quem é sua empresa',
      passed: audit.hasOrganizationOrLocalBusiness,
      detail: audit.hasOrganizationOrLocalBusiness
        ? `Encontrado: ${audit.businessSchemaTypes.join(', ')}`
        : 'Nenhuma marcação Schema.org de negócio encontrada na página',
      dica: 'Adicione dados estruturados (Schema.org) — é assim que a IA confirma quem você é.',
    },
    {
      label: 'Perguntas frequentes estruturadas (ajudam respostas de IA)',
      passed: audit.hasFaqPage,
      detail:
        !audit.hasFaqPage && audit.hasFaqText
          ? 'Encontramos uma seção de FAQ visível no site, mas sem a marcação FAQPage — pra IA, essas respostas não existem.'
          : undefined,
      dica: audit.hasFaqText
        ? 'Adicione a marcação FAQPage à seção de perguntas que você já tem — hoje a IA não a enxerga.'
        : 'Crie uma seção de perguntas frequentes com marcação FAQPage — IAs adoram citar FAQs.',
    },
    {
      label: 'Conteúdo legível sem depender de JavaScript',
      passed: audit.textToHtmlRatio >= 0.05,
      detail:
        audit.textToHtmlRatio < 0.05
          ? `Apenas ${(audit.textToHtmlRatio * 100).toFixed(1)}% do HTML é texto: provável site 100% client-side. Pra IA, a página parece vazia.`
          : `${(audit.textToHtmlRatio * 100).toFixed(1)}% do HTML é texto legível`,
      dica: 'Renderize o conteúdo no servidor (SSR/SSG) pra IA enxergar o que está na página.',
    },
    {
      label: 'Arquivo llms.txt (padrão novo para IA encontrar sua empresa)',
      passed: audit.llmsTxtExists,
      dica: 'Publique um arquivo llms.txt — padrão emergente que apresenta sua empresa às IAs.',
    },
  ]

  const nota = notaDosChecks(checks)
  return { id: 'ia', nome: 'Visibilidade para IA', nota, faixa: faixaDaNota(nota), disponivel: true, checks }
}

function buildPresenca(audit: SiteAudit): CategoryResult {
  const checks: CheckItem[] = [
    {
      label: 'Conexão segura (HTTPS)',
      passed: audit.httpsAtivo,
      dica: 'Ative o certificado SSL — sem ele, o navegador marca seu site como "não seguro".',
    },
    {
      label: 'Site adaptado para celular',
      passed: audit.viewportMeta,
      dica: 'Adicione a meta viewport e adapte o layout — a maioria dos acessos vem do celular.',
    },
    {
      label: 'Compartilhamento em redes sociais com título/imagem (Open Graph)',
      passed: !!(audit.ogTitle && audit.ogDescription && audit.ogImage),
      dica: 'Configure as tags Open Graph pra seu link aparecer com imagem e título ao ser compartilhado.',
    },
    {
      label: 'Ícone do site (favicon)',
      passed: audit.favicon,
      dica: 'Adicione um favicon — sem ele, seu site parece inacabado na aba do navegador.',
    },
    {
      label: 'Links para redes sociais no site',
      passed: audit.socialLinksCount > 0,
      dica: 'Linke suas redes sociais no site: presença ativa conta pontos de confiança.',
    },
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
