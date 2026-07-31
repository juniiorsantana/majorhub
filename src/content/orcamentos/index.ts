import type { Orcamento, PlanoOrcamento } from './types'
import { costalima } from './costalima'

/** Registro de propostas. Para um novo cliente: crie o arquivo e adicione aqui. */
const orcamentos: Record<string, Orcamento> = {
  [costalima.slug]: costalima,
}

export function getOrcamento(slug: string): Orcamento | undefined {
  return orcamentos[slug.toLowerCase()]
}

export function getOrcamentoSlugs(): string[] {
  return Object.keys(orcamentos)
}

/** Data limite de aceite, já formatada em pt-BR. */
export function getValidadeFormatada(orcamento: Orcamento): string {
  const emissao = new Date(`${orcamento.proposta.emitidaEm}T00:00:00`)
  const limite = new Date(emissao)
  limite.setDate(limite.getDate() + orcamento.proposta.validadeDias)

  return limite.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Destino do botão de aceite. Enquanto o checkoutUrl do plano estiver vazio,
 * cai no WhatsApp com o plano já identificado na mensagem.
 */
export function getDestinoAceite(orcamento: Orcamento, plano: PlanoOrcamento): string {
  if (plano.checkoutUrl) return plano.checkoutUrl

  const mensagem = `Olá! Aceito a proposta e quero seguir com o plano ${plano.nome} (${plano.valor}${plano.periodo}).`
  return `https://wa.me/${orcamento.contato.whatsapp}?text=${encodeURIComponent(mensagem)}`
}

export type { Orcamento, PlanoOrcamento, TemaOrcamento, TemaPreset, TemaToken } from './types'
export { getTemaClassName, getTemaStyle } from './temas'
