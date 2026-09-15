import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * O diagnóstico assinado pelo servidor, para o lead não poder inventar o próprio.
 *
 * `/api/diagnostico` assina o resumo que ele mesmo calculou; `/api/lead` só
 * aceita o resumo de volta se a assinatura bater. Sem isso, qualquer um poderia
 * chamar `/api/lead` com uma nota inventada — ou com um "site" que vira texto na
 * mensagem que a Major manda pelo WhatsApp.
 *
 * Formato: `base64url(json).base64url(hmac-sha256)`. Não é segredo o conteúdo
 * (o próprio visitante acabou de ver a nota); é prova de origem.
 */

export interface ResumoDoDiagnostico {
  dominio: string
  notaGeral: number
  faixa: string
  categorias: { nome: string; nota: number }[]
  falhas: string[]
  servico: string
  geradoEm: string
}

/** Um diagnóstico vale para desbloquear o relatório por um dia. */
export const VALIDADE_DA_ASSINATURA_MS = 24 * 60 * 60 * 1000

const b64url = (dados: Buffer | string) => Buffer.from(dados).toString('base64url')

function hmac(conteudo: string, segredo: string) {
  return createHmac('sha256', segredo).update(conteudo).digest()
}

export function assinarDiagnostico(resumo: ResumoDoDiagnostico, segredo: string): string {
  const conteudo = b64url(JSON.stringify(resumo))
  return `${conteudo}.${b64url(hmac(conteudo, segredo))}`
}

export function lerDiagnosticoAssinado(
  token: unknown,
  segredo: string,
  agora: number = Date.now(),
): ResumoDoDiagnostico | null {
  if (typeof token !== 'string' || token.length > 8192 || !segredo) return null
  const [conteudo, assinatura, sobra] = token.split('.')
  if (!conteudo || !assinatura || sobra !== undefined) return null

  const esperada = hmac(conteudo, segredo)
  const recebida = Buffer.from(assinatura, 'base64url')
  if (recebida.length !== esperada.length || !timingSafeEqual(recebida, esperada)) return null

  let resumo: ResumoDoDiagnostico
  try {
    resumo = JSON.parse(Buffer.from(conteudo, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  const gerado = Date.parse(resumo?.geradoEm)
  if (!Number.isFinite(gerado) || agora - gerado > VALIDADE_DA_ASSINATURA_MS || gerado - agora > 60_000) {
    return null
  }
  return resumo
}
