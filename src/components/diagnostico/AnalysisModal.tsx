'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { diagnosticoCopy } from '@/content/diagnostico-copy'

interface Props {
  open: boolean
  dominio: string
}

const STEP_MS = 1600

export function AnalysisModal({ open, dominio }: Props) {
  const steps = diagnosticoCopy.loadingSteps
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (!open) return

    const resetTimer = window.setTimeout(() => setStepIndex(0), 0)
    const interval = setInterval(() => {
      // Para no último step — a barra fica "quase lá" até a análise concluir
      setStepIndex(i => Math.min(i + 1, steps.length - 1))
    }, STEP_MS)
    return () => {
      window.clearTimeout(resetTimer)
      clearInterval(interval)
    }
  }, [open, steps.length])

  const progress = Math.min(((stepIndex + 1) / steps.length) * 100, 92)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          style={{ background: 'rgba(10,37,64,0.55)', backdropFilter: 'blur(8px)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Analisando seu site"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-8 md:p-10 text-center"
          >
            {/* Radar animado */}
            <div className="relative w-24 h-24 mx-auto mb-7">
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-[#0099ff]/30"
                animate={{ scale: [1, 1.45], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-[#0099ff]/30"
                animate={{ scale: [1, 1.45], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
              />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#0099ff] to-[#667eea] flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={stepIndex}
                    initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl"
                  >
                    {steps[stepIndex].icon}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            <h3 className="font-sora font-bold text-[#0a2540] text-lg mb-1.5">
              Analisando {dominio || 'seu site'}
            </h3>

            <div className="h-6 mb-6">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm text-slate-500"
                >
                  {steps[stepIndex].label}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Barra de progresso */}
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#0099ff] to-[#667eea]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            <p className="text-xs text-slate-400 mt-4">Isso leva menos de um minuto.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
