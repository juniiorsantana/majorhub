import { copy } from '../../content/copy'
import { diagnosticoCopy } from '../../content/diagnostico-copy'
import type { ResumoDoDiagnostico } from './assinatura'
import type { DiagnosticoResultado } from './types'

/** O serviço que o relatório sugere: o da pior categoria disponível. */
export function recomendarServico(resultado: DiagnosticoResultado) {
  const disponiveis = resultado.categorias.filter(c => c.disponivel)
  const pior = [...disponiveis].sort((a, b) => a.nota - b.nota)[0]
  const servicoId = pior ? diagnosticoCopy.servicoPorCategoria[pior.id] : 'site'
  return copy.servicos.find(s => s.id === servicoId) ?? copy.servicos[1]
}

/**
 * O que a equipe precisa saber do diagnóstico, e nada mais.
 *
 * As falhas vêm das piores categorias primeiro — é por elas que a conversa com
 * o lead começa — e sem o parêntese explicativo do rótulo, que é para o
 * visitante e não cabe num aviso de WhatsApp.
 */
export function resumirDiagnostico(resultado: DiagnosticoResultado): ResumoDoDiagnostico {
  const disponiveis = resultado.categorias.filter(c => c.disponivel)
  const falhas = [...disponiveis]
    .sort((a, b) => a.nota - b.nota)
    .flatMap(c => c.checks.filter(check => !check.passed).map(check => check.label.replace(/\s*\(.*\)\s*$/, '').trim()))
    .filter(Boolean)
    .slice(0, 5)

  return {
    dominio: resultado.dominio,
    notaGeral: resultado.notaGeral,
    faixa: diagnosticoCopy.faixaLabel[resultado.faixaGeral],
    categorias: disponiveis.map(c => ({ nome: c.nome, nota: c.nota })),
    falhas,
    servico: recomendarServico(resultado).titulo,
    geradoEm: resultado.geradoEm,
  }
}
