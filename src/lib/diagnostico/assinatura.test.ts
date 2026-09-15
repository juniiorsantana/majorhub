import { describe, expect, it } from 'vitest'
import { assinarDiagnostico, lerDiagnosticoAssinado, VALIDADE_DA_ASSINATURA_MS, type ResumoDoDiagnostico } from './assinatura'

const SEGREDO = 'segredo-de-teste'
const AGORA = Date.parse('2026-09-15T12:00:00.000Z')

const resumo: ResumoDoDiagnostico = {
  dominio: 'empresa.com.br',
  notaGeral: 42,
  faixa: 'Regular',
  categorias: [{ nome: 'SEO & Conteúdo', nota: 38 }],
  falhas: ['Meta description presente'],
  servico: 'Site Profissional',
  geradoEm: new Date(AGORA - 60_000).toISOString(),
}

describe('diagnóstico assinado', () => {
  it('lê de volta exatamente o que o servidor assinou', () => {
    const token = assinarDiagnostico(resumo, SEGREDO)
    expect(lerDiagnosticoAssinado(token, SEGREDO, AGORA)).toEqual(resumo)
  })

  it('recusa nota adulterada pelo navegador', () => {
    const [, assinatura] = assinarDiagnostico(resumo, SEGREDO).split('.')
    const forjado = Buffer.from(JSON.stringify({ ...resumo, notaGeral: 99 })).toString('base64url')
    expect(lerDiagnosticoAssinado(`${forjado}.${assinatura}`, SEGREDO, AGORA)).toBeNull()
  })

  it('recusa site trocado para virar texto na mensagem da Major', () => {
    const [, assinatura] = assinarDiagnostico(resumo, SEGREDO).split('.')
    const forjado = Buffer.from(JSON.stringify({ ...resumo, dominio: 'golpe.com' })).toString('base64url')
    expect(lerDiagnosticoAssinado(`${forjado}.${assinatura}`, SEGREDO, AGORA)).toBeNull()
  })

  it('recusa assinatura feita com outro segredo', () => {
    expect(lerDiagnosticoAssinado(assinarDiagnostico(resumo, 'outro'), SEGREDO, AGORA)).toBeNull()
  })

  it('recusa diagnóstico velho e diagnóstico do futuro', () => {
    const velho = { ...resumo, geradoEm: new Date(AGORA - VALIDADE_DA_ASSINATURA_MS - 1).toISOString() }
    const futuro = { ...resumo, geradoEm: new Date(AGORA + 5 * 60_000).toISOString() }
    expect(lerDiagnosticoAssinado(assinarDiagnostico(velho, SEGREDO), SEGREDO, AGORA)).toBeNull()
    expect(lerDiagnosticoAssinado(assinarDiagnostico(futuro, SEGREDO), SEGREDO, AGORA)).toBeNull()
  })

  it.each([undefined, '', 'sem-ponto', 'a.b.c', 42, 'x'.repeat(9000)])('recusa entrada malformada: %s', entrada => {
    expect(lerDiagnosticoAssinado(entrada, SEGREDO, AGORA)).toBeNull()
  })

  it('sem segredo configurado, nada é aceito', () => {
    expect(lerDiagnosticoAssinado(assinarDiagnostico(resumo, SEGREDO), '', AGORA)).toBeNull()
  })
})
