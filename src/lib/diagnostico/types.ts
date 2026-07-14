export type Faixa = 'critico' | 'regular' | 'bom' | 'otimo'

/** Bandas granulares de score, usadas nas mensagens de direção (nota geral e categoria IA) */
export type Banda = '0-20' | '21-40' | '41-50' | '51-60' | '61-75' | '76-85' | '86-100'

export type CategoriaId = 'desempenho' | 'seo' | 'ia' | 'presenca'

export interface CheckItem {
  label: string
  passed: boolean
  detail?: string
  /** Recomendação de correção, exibida quando o check falha (conteúdo desbloqueável) */
  dica?: string
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
  /** Tipos Schema.org de negócio encontrados (ex: ['Physician']) — evidência exibida no relatório */
  businessSchemaTypes: string[]
  hasFaqPage: boolean
  /** Há seção de FAQ visível no texto da página (mesmo sem marcação FAQPage) */
  hasFaqText: boolean
  socialLinksCount: number
  textToHtmlRatio: number
  robots: RobotsAnalise
  sitemapExists: boolean
  llmsTxtExists: boolean
}
