'use client'
import type { CategoryResult } from '@/lib/diagnostico/types'
import { FAIXA_COLOR } from './ScoreGauge'

interface Props {
  categoria: CategoryResult
  locked: boolean
}

export function CategoryScoreCard({ categoria, locked }: Props) {
  const color = FAIXA_COLOR[categoria.faixa]

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-[0_12px_36px_-18px_rgba(10,37,64,0.2)] p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-sora font-bold text-[#0a2540] text-base">{categoria.nome}</h4>
        <span className="font-sora font-extrabold text-xl" style={{ color }}>
          {categoria.disponivel ? categoria.nota : '—'}
        </span>
      </div>

      <div className={locked ? 'blur-sm select-none pointer-events-none' : ''}>
        <ul className="space-y-2.5">
          {categoria.checks.map((check, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span aria-hidden className="shrink-0">{check.passed ? '✅' : '❌'}</span>
              <div>
                <p className="text-slate-600 leading-snug">{check.label}</p>
                {check.detail && <p className="text-slate-400 text-xs mt-0.5">{check.detail}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {locked && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.45)' }}
          aria-hidden
        >
          <span className="text-2xl">🔒</span>
        </div>
      )}
    </div>
  )
}
