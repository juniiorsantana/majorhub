import type { ResumoDoDiagnostico } from '../diagnostico/assinatura'

/**
 * O envio do lead para o Núcleo Major, que chama o lead no WhatsApp e avisa a equipe.
 *
 * O Núcleo recebe numa função do Supabase dele (`nucleo_site_lead_receive`),
 * com a chave publicável e o token da campanha. As três variáveis ficam só no
 * servidor da Vercel: o token é o que dá a este site o direito de fazer a Major
 * mandar uma mensagem, e nunca pode chegar ao navegador.
 */

export interface LeadParaONucleo {
  nome: string
  telefone: string
  email?: string
  site: string
  consentimento: boolean
  diagnostico?: {
    notaGeral: number
    faixa: string
    categorias: { nome: string; nota: number }[]
    falhas: string[]
    servico: string
  }
}

export interface ConfigDoNucleo {
  url: string
  chave: string
  token: string
}

export function configDoNucleo(env: Record<string, string | undefined> = process.env): ConfigDoNucleo | null {
  const url = String(env.NUCLEO_SUPABASE_URL || '').trim().replace(/\/$/, '')
  const chave = String(env.NUCLEO_SUPABASE_KEY || '').trim()
  const token = String(env.NUCLEO_LEAD_TOKEN || '').trim()
  if (!/^https:\/\/[^\s/]+$/.test(url) || !chave || !/^[0-9a-f]{64}$/.test(token)) return null
  return { url, chave, token }
}

/**
 * Monta o lead a partir do que o formulário mandou e do diagnóstico ASSINADO.
 *
 * O site e as notas saem só do resumo assinado. O domínio que o navegador
 * informa não entra: ele viraria texto na mensagem que a Major manda.
 */
export function montarLeadParaONucleo(
  entrada: { name: string; whatsapp: string; email?: string; consentimento: boolean },
  resumo: ResumoDoDiagnostico,
): LeadParaONucleo {
  return {
    nome: entrada.name,
    telefone: entrada.whatsapp,
    email: entrada.email,
    site: resumo.dominio,
    consentimento: entrada.consentimento === true,
    diagnostico: {
      notaGeral: resumo.notaGeral,
      faixa: resumo.faixa,
      categorias: resumo.categorias,
      falhas: resumo.falhas,
      servico: resumo.servico,
    },
  }
}

export async function enviarLeadAoNucleo(
  lead: LeadParaONucleo,
  config: ConfigDoNucleo,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 8000,
): Promise<{ ok: boolean; status?: number; motivo?: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetchImpl(`${config.url}/rest/v1/rpc/nucleo_site_lead_receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.chave,
      },
      body: JSON.stringify({ intake_token: config.token, lead }),
      signal: controller.signal,
    })
    if (res.ok) return { ok: true, status: res.status }
    // A mensagem do Postgres diz o motivo ("too many leads...", "phone number
    // is invalid") sem dado do lead; é ela que vai para o log.
    const corpo = await res.json().catch(() => ({}))
    return { ok: false, status: res.status, motivo: String(corpo?.message || '').slice(0, 120) }
  } catch (err) {
    return { ok: false, motivo: err instanceof Error ? err.name : 'erro' }
  } finally {
    clearTimeout(timer)
  }
}
