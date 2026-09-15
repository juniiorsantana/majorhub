import { describe, expect, it } from 'vitest'
import { recomendarServico, resumirDiagnostico } from './resumo'
import type { CategoryResult, DiagnosticoResultado } from './types'

const categoria = (id: CategoryResult['id'], nome: string, nota: number, falhas: string[], disponivel = true): CategoryResult => ({
  id,
  nome,
  nota,
  faixa: nota < 40 ? 'critico' : 'regular',
  disponivel,
  checks: [
    { label: 'Item que passou', passed: true },
    ...falhas.map(label => ({ label, passed: false })),
  ],
})

const resultado: DiagnosticoResultado = {
  url: 'https://empresa.com.br',
  dominio: 'empresa.com.br',
  notaGeral: 42,
  faixaGeral: 'regular',
  geradoEm: '2026-09-15T12:00:00.000Z',
  categorias: [
    categoria('desempenho', 'Desempenho', 70, ['Servidor responde rápido']),
    categoria('seo', 'SEO & Conteúdo', 38, ['Meta description presente (resumo que aparece no Google)', 'Sitemap.xml acessível']),
    categoria('ia', 'Visibilidade para IA', 20, ['Arquivo llms.txt (padrão novo para IA encontrar sua empresa)', 'IAs conseguem acessar seu site (robots.txt não bloqueia)', 'Perguntas frequentes estruturadas (ajudam respostas de IA)']),
    categoria('presenca', 'Presença Digital', 90, [], false),
  ],
}

describe('resumo do diagnóstico para a equipe', () => {
  it('leva a nota, a faixa legível e só as categorias disponíveis', () => {
    const resumo = resumirDiagnostico(resultado)
    expect(resumo.dominio).toBe('empresa.com.br')
    expect(resumo.notaGeral).toBe(42)
    expect(resumo.faixa).toBe('Regular')
    expect(resumo.categorias).toEqual([
      { nome: 'Desempenho', nota: 70 },
      { nome: 'SEO & Conteúdo', nota: 38 },
      { nome: 'Visibilidade para IA', nota: 20 },
    ])
    expect(resumo.geradoEm).toBe(resultado.geradoEm)
  })

  it('lista as falhas das piores categorias primeiro, sem o parêntese e no máximo cinco', () => {
    expect(resumirDiagnostico(resultado).falhas).toEqual([
      'Arquivo llms.txt',
      'IAs conseguem acessar seu site',
      'Perguntas frequentes estruturadas',
      'Meta description presente',
      'Sitemap.xml acessível',
    ])
  })

  it('o serviço é o mesmo que o relatório mostra, sem reordenar o resultado original', () => {
    const ordemAntes = resultado.categorias.map(c => c.id)
    expect(resumirDiagnostico(resultado).servico).toBe(recomendarServico(resultado).titulo)
    expect(resultado.categorias.map(c => c.id)).toEqual(ordemAntes)
  })
})
