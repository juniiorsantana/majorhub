export type Faixa = 'critico' | 'regular' | 'bom' | 'otimo'

export type CategoriaId = 'desempenho' | 'seo' | 'ia' | 'presenca'

export interface CheckItem {
  label: string
  passed: boolean
  detail?: string
}

export interface CategoryResult {
  id: CategoriaId
  nome: string
  nota: number
  faixa: Faixa
  checks: CheckItem[]
  disponivel: boolean
}

export interface DiagnosticoResultado {
  url: string
  dominio: string
  notaGeral: number
  faixaGeral: Faixa
  categorias: CategoryResult[]
  geradoEm: string
}

export interface RobotsAnalise {
  fetched: boolean
  blocksAiCrawlers: boolean
  blockedBots: string[]
  disallowsAll: boolean
}

export interface SiteAudit {
  fetchOk: boolean
  erro?: string
  finalUrl: string
  httpsAtivo: boolean
  statusCode?: number
  responseTimeMs: number
  htmlKb: number
  scriptCount: number
  title?: string
  titleLength: number
  metaDescription?: string
  h1Count: number
  imagesTotal: number
  imagesSemAlt: number
  canonical?: string
  viewportMeta: boolean
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  favicon: boolean
  hasOrganizationOrLocalBusiness: boolean
  hasFaqPage: boolean
  socialLinksCount: number
  textToHtmlRatio: number
  robots: RobotsAnalise
  sitemapExists: boolean
  llmsTxtExists: boolean
}
