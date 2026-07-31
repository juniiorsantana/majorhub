import type { CSSProperties } from 'react'

/**
 * Presets visuais das propostas. Cada um corresponde a uma classe
 * .orc-tema-* definida em src/app/orc/orcamento.css.
 */
export type TemaPreset = 'editorial-claro' | 'majorhub-escuro'

/** Tokens que podem ser ajustados por cliente sem criar um preset novo. */
export type TemaToken =
  | 'surface'
  | 'contrastBg'
  | 'contrastText'
  | 'text'
  | 'textSoft'
  | 'accent'
  | 'accentSoft'
  | 'line'

export interface TemaOrcamento {
  preset: TemaPreset
  /**
   * Sobrescreve tokens do preset. Ex.: { accent: '#8C6D3F' }.
   * A cor de fundo da página não entra aqui — ela também pinta o <body>,
   * que não enxerga variáveis declaradas no wrapper. Para outro fundo,
   * crie um preset em orcamento.css.
   */
  tokens?: Partial<Record<TemaToken, string>>
}

const CSS_VAR: Record<TemaToken, string> = {
  surface: '--orc-surface',
  contrastBg: '--orc-contrast-bg',
  contrastText: '--orc-contrast-text',
  text: '--orc-text',
  textSoft: '--orc-text-soft',
  accent: '--orc-accent',
  accentSoft: '--orc-accent-soft',
  line: '--orc-line',
}

export function getTemaClassName(tema: TemaOrcamento): string {
  return `orc-tema-${tema.preset}`
}

export function getTemaStyle(tema: TemaOrcamento): CSSProperties {
  if (!tema.tokens) return {}

  return Object.fromEntries(
    Object.entries(tema.tokens)
      .filter(([, valor]) => Boolean(valor))
      .map(([token, valor]) => [CSS_VAR[token as TemaToken], valor]),
  ) as CSSProperties
}
