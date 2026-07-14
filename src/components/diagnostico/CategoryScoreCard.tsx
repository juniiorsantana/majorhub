'use client'
import type { CategoryResult } from '@/lib/diagnostico/types'
import { diagnosticoCopy } from '@/content/diagnostico-copy'
import { bandaDaNota } from '@/lib/diagnostico/score'
import { FAIXA_COLOR } from './ScoreGauge'

interface Props {
  categoria: CategoryResult
  locked: boolean
}

export function CategoryScoreCard({ categoria, locked }: Props) {
  const color = FAIXA_COLOR[categoria.faixa]
  const falhas = categoria.checks.filter(c => !c.passed).length

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-[0_12px_36px_-18px_rgba(10,37,64,0.2)] p-6">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-sora font-bold text-[#0a2540] text-base">{categoria.nome}</h4>
        <span className="font-sora font-extrabold text-xl" style={{ color }}>
          {categoria.disponivel ? categoria.nota : '—'}
        </span>
      </div>

      {/* Barra de progresso da nota */}
      <div className="h-1.5 rounded-full bg-slate-100 mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${categoria.disponivel ? categoria.nota : 0}%`, background: color }}
        />
      </div>

      {/* Leitura da categoria — sempre visível. IA usa as 7 bandas granulares */}
      {categoria.disponivel && (
        <p className="text-sm text-slate-600 leading-relaxed mb-5 pb-4 border-b border-slate-100">
          {categoria.id === 'ia'
            ? diagnosticoCopy.direcaoIa[bandaDaNota(categoria.nota)]
            : diagnosticoCopy.categoriaMensagem[categoria.id][categoria.faixa]}
        </p>
      )}

      <ul className="space-y-3">
        {categoria.checks.map((check, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <span
              aria-hidden
              className={`shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                check.passed ? 'bg-[#22c55e]' : 'bg-[#ef4444]'
              }`}
            >
              {check.passed ? '✓' : '✕'}
            </span>
            <div className="min-w-0">
              <p className="text-slate-600 leading-snug">{check.label}</p>
              {check.detail && <p className="text-slate-400 text-xs mt-0.5">{check.detail}</p>}

              {/* Recomendação: o conteúdo desbloqueável */}
              {!check.passed && check.dica && (
                <p
                  className={`text-xs mt-1 font-medium text-[#0099ff] ${
                    locked ? 'blur-[5px] select-none' : ''
                  }`}
                  aria-hidden={locked}
                >
                  → {check.dica}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {locked && falhas > 0 && (
        <p className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-1.5">
          <span aria-hidden>🔒</span>
          {falhas === 1
            ? '1 correção recomendada — desbloqueie abaixo pra ver como resolver.'
            : `${falhas} correções recomendadas — desbloqueie abaixo pra ver como resolver.`}
        </p>
      )}
    </div>
  )
}
