'use client'
import { motion } from 'framer-motion'
import type { Faixa } from '@/lib/diagnostico/types'
import { diagnosticoCopy } from '@/content/diagnostico-copy'

export const FAIXA_COLOR: Record<Faixa, string> = {
  critico: '#ef4444',
  regular: '#f59e0b',
  bom: '#0099ff',
  otimo: '#22c55e',
}

interface ScoreGaugeProps {
  nota: number
  faixa: Faixa
  size?: number
}

export function ScoreGauge({ nota, faixa, size = 180 }: ScoreGaugeProps) {
  const stroke = 14
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const color = FAIXA_COLOR[faixa]

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(10,37,64,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - nota / 100) }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-sora font-extrabold text-[clamp(32px,5vw,44px)]" style={{ color }}>
          {nota}
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
          {diagnosticoCopy.faixaLabel[faixa]}
        </span>
      </div>
    </div>
  )
}
