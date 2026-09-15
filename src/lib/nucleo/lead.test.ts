import { describe, expect, it, vi } from 'vitest'
import type { ResumoDoDiagnostico } from '../diagnostico/assinatura'
import { configDoNucleo, enviarLeadAoNucleo, montarLeadParaONucleo } from './lead'

const TOKEN = 'a'.repeat(64)
const config = { url: 'https://nucleo.supabase.co', chave: 'sb_publishable_x', token: TOKEN }

const resumo: ResumoDoDiagnostico = {
  dominio: 'empresa.com.br',
  notaGeral: 42,
  faixa: 'Regular',
  categorias: [{ nome: 'SEO & Conteúdo', nota: 38 }],
  falhas: ['Meta description presente'],
  servico: 'Site Profissional',
  geradoEm: '2026-09-15T12:00:00.000Z',
}

describe('configuração do Núcleo', () => {
  it('só liga com as três variáveis válidas', () => {
    expect(configDoNucleo({ NUCLEO_SUPABASE_URL: 'https://nucleo.supabase.co/', NUCLEO_SUPABASE_KEY: 'k', NUCLEO_LEAD_TOKEN: TOKEN }))
      .toEqual({ url: 'https://nucleo.supabase.co', chave: 'k', token: TOKEN })
    expect(configDoNucleo({ NUCLEO_SUPABASE_URL: 'https://nucleo.supabase.co', NUCLEO_SUPABASE_KEY: 'k' })).toBeNull()
    expect(configDoNucleo({ NUCLEO_SUPABASE_URL: 'http://nucleo.supabase.co', NUCLEO_SUPABASE_KEY: 'k', NUCLEO_LEAD_TOKEN: TOKEN })).toBeNull()
    expect(configDoNucleo({ NUCLEO_SUPABASE_URL: 'https://nucleo.supabase.co', NUCLEO_SUPABASE_KEY: 'k', NUCLEO_LEAD_TOKEN: 'curto' })).toBeNull()
    expect(configDoNucleo({})).toBeNull()
  })
})

describe('lead para o Núcleo', () => {
  it('o site e as notas saem do diagnóstico assinado, nunca do navegador', () => {
    const lead = montarLeadParaONucleo(
      { name: 'Ana Souza', whatsapp: '65999998164', email: 'ana@empresa.com.br', consentimento: true },
      resumo,
    )
    expect(lead).toEqual({
      nome: 'Ana Souza',
      telefone: '65999998164',
      email: 'ana@empresa.com.br',
      site: 'empresa.com.br',
      consentimento: true,
      diagnostico: {
        notaGeral: 42,
        faixa: 'Regular',
        categorias: [{ nome: 'SEO & Conteúdo', nota: 38 }],
        falhas: ['Meta description presente'],
        servico: 'Site Profissional',
      },
    })
  })

  it('consentimento só é true quando é true', () => {
    const lead = montarLeadParaONucleo(
      { name: 'Ana', whatsapp: '65999998164', consentimento: 'true' as unknown as boolean },
      resumo,
    )
    expect(lead.consentimento).toBe(false)
  })

  it('chama a função do Núcleo com a chave publicável e o token no corpo', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ accepted: true }), { status: 200 }))
    const lead = montarLeadParaONucleo({ name: 'Ana', whatsapp: '65999998164', consentimento: true }, resumo)

    const resultado = await enviarLeadAoNucleo(lead, config, fetchImpl as unknown as typeof fetch)

    expect(resultado).toEqual({ ok: true, status: 200 })
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://nucleo.supabase.co/rest/v1/rpc/nucleo_site_lead_receive')
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).apikey).toBe('sb_publishable_x')
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined()
    expect(JSON.parse(String(init.body))).toEqual({ intake_token: TOKEN, lead })
  })

  it('recusa do Núcleo volta com o motivo do Postgres, sem derrubar', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ message: 'too many leads in the last hour' }), { status: 400 }))
    const lead = montarLeadParaONucleo({ name: 'Ana', whatsapp: '65999998164', consentimento: true }, resumo)
    await expect(enviarLeadAoNucleo(lead, config, fetchImpl as unknown as typeof fetch))
      .resolves.toEqual({ ok: false, status: 400, motivo: 'too many leads in the last hour' })
  })

  it('Núcleo fora do ar não derruba o formulário', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fetch failed')
    })
    const lead = montarLeadParaONucleo({ name: 'Ana', whatsapp: '65999998164', consentimento: true }, resumo)
    await expect(enviarLeadAoNucleo(lead, config, fetchImpl as unknown as typeof fetch))
      .resolves.toEqual({ ok: false, motivo: 'TypeError' })
  })
})
