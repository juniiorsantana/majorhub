'use client'
import { motion } from 'framer-motion'
import { diagnosticoCopy } from '@/content/diagnostico-copy'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.55, delayChildren: 0.3 } },
}

const bubble = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

export function AiChatMockup() {
  const m = diagnosticoCopy.mockup

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="w-full max-w-xl mx-auto rounded-2xl bg-white border border-slate-200 shadow-[0_24px_60px_-24px_rgba(10,37,64,0.25)] overflow-hidden"
      aria-hidden
    >
      {/* Barra da janela */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded-full bg-gradient-to-br from-[#0099ff] to-[#667eea] text-white text-[9px] leading-4 text-center font-bold">✦</span>
          {m.janela}
        </span>
      </div>

      <div className="p-5 md:p-7 space-y-4">
        {/* Pergunta do usuário */}
        <motion.div variants={bubble} className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#0a2540] text-white text-sm px-4 py-3 leading-relaxed">
            {m.pergunta}
          </div>
        </motion.div>

        {/* Resposta da IA */}
        <motion.div variants={bubble} className="flex justify-start">
          <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 space-y-3">
            <p className="text-sm text-slate-600 leading-relaxed">{m.respostaIntro}</p>

            {/* Card do concorrente */}
            <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-[#0099ff] to-[#667eea] text-white font-sora font-bold flex items-center justify-center">
                C
              </div>
              <div>
                <p className="text-sm font-bold text-[#0a2540] flex items-center gap-2 flex-wrap">
                  {m.concorrente}
                  <span className="text-[11px] font-semibold text-amber-500">★★★★★ 4,9</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{m.concorrenteDetalhe}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alerta */}
        <motion.div variants={bubble}>
          <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <span className="text-base">⚠️</span>
            <p className="text-sm font-semibold text-red-600">{m.alerta}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
