'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { copy } from '@/content/copy'
import { diagnosticoCopy } from '@/content/diagnostico-copy'
import type { DiagnosticoResultado } from '@/lib/diagnostico/types'
import { ScoreGauge } from './ScoreGauge'
import { CategoryScoreCard } from './CategoryScoreCard'
import { LeadForm } from './LeadForm'
import { AnalysisModal } from './AnalysisModal'
import { BrilhoButton } from '@/components/ui/BrilhoButton'
import { pushEvent } from '@/lib/analytics'

type Status = 'idle' | 'loading' | 'erro' | 'resultado'

const PHONE = '5565992178164'
const MIN_ANALYSIS_MS = 6500

function buildWhatsappUrl(resultado: DiagnosticoResultado) {
  const msg = `Olá! Analisei meu site (${resultado.dominio}) na ferramenta da Major e tive nota ${resultado.notaGeral}/100. Quero entender como melhorar.`
  const params = new URLSearchParams({
    text: msg,
    utm_source: 'site',
    utm_medium: 'diagnostico',
    utm_campaign: 'diagnostico_digital',
  })
  return `https://wa.me/${PHONE}?${params.toString()}`
}

function recomendarServico(resultado: DiagnosticoResultado) {
  const disponiveis = resultado.categorias.filter(c => c.disponivel)
  const pior = disponiveis.sort((a, b) => a.nota - b.nota)[0]
  const servicoId = pior ? diagnosticoCopy.servicoPorCategoria[pior.id] : 'site'
  return copy.servicos.find(s => s.id === servicoId) ?? copy.servicos[1]
}

function extrairDominio(input: string) {
  try {
    const url = /^https?:\/\//i.test(input) ? input : `https://${input}`
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return input
  }
}

export function DiagnosticoApp() {
  const [status, setStatus] = useState<Status>('idle')
  const [url, setUrl] = useState('')
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState<DiagnosticoResultado | null>(null)
  const [unlocked, setUnlocked] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || status === 'loading') return

    setStatus('loading')
    setErro('')
    setUnlocked(false)

    // Garante tempo mínimo de exibição do modal (as animações contam a história da análise)
    const minDelay = new Promise(resolve => setTimeout(resolve, MIN_ANALYSIS_MS))

    try {
      const request = fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      }).then(async res => ({ res, data: await res.json() }))

      const [{ res, data }] = await Promise.all([request, minDelay])

      if (!res.ok) {
        setErro(data.erro || diagnosticoCopy.erroAnalise)
        setStatus('erro')
        return
      }

      pushEvent('diagnostico_resultado', { dominio: data.dominio, nota: data.notaGeral })
      setResultado(data)
      setStatus('resultado')
    } catch {
      await minDelay
      setErro(diagnosticoCopy.erroAnalise)
      setStatus('erro')
    }
  }

  const servicoRecomendado = resultado ? recomendarServico(resultado) : null

  const inputClass =
    'flex-1 px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-[#0a2540] placeholder:text-slate-400 focus:border-[#0099ff] focus:ring-2 focus:ring-[#0099ff]/20 outline-none transition-all'

  return (
    <div className="max-w-3xl mx-auto">
      <AnalysisModal open={status === 'loading'} dominio={extrairDominio(url)} />

      {(status === 'idle' || status === 'loading' || status === 'erro') && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white border border-slate-200 shadow-[0_16px_48px_-20px_rgba(10,37,64,0.25)] p-5 md:p-7 flex flex-col md:flex-row gap-3"
        >
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder={diagnosticoCopy.ferramenta.placeholder}
            disabled={status === 'loading'}
            className={inputClass}
            aria-label="URL do seu site"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-7 py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#0099ff] to-[#667eea] hover:brightness-110 hover:shadow-[0_8px_24px_-6px_rgba(0,153,255,0.5)] transition-all disabled:opacity-60 whitespace-nowrap"
          >
            {status === 'loading' ? 'Analisando...' : diagnosticoCopy.ferramenta.cta}
          </button>
        </form>
      )}

      {status === 'erro' && (
        <p className="text-center text-red-500 text-sm mt-5 font-medium">{erro}</p>
      )}

      <AnimatePresence>
        {status === 'resultado' && resultado && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 space-y-10"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="rounded-3xl bg-white border border-slate-200 shadow-[0_16px_48px_-20px_rgba(10,37,64,0.2)] px-10 py-8 flex flex-col items-center gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Nota de {resultado.dominio}
                </p>
                <ScoreGauge nota={resultado.notaGeral} faixa={resultado.faixaGeral} />
                <p className="text-slate-600 max-w-lg">{diagnosticoCopy.faixaMensagem[resultado.faixaGeral]}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {resultado.categorias.map(categoria => (
                <CategoryScoreCard key={categoria.id} categoria={categoria} locked={!unlocked} />
              ))}
            </div>

            {!unlocked && <LeadForm onUnlock={() => setUnlocked(true)} />}

            {unlocked && servicoRecomendado && (
              <div className="rounded-3xl bg-[#0a2540] p-8 md:p-12 text-center overflow-hidden relative">
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 30% 20%, rgba(0,153,255,0.35), transparent 55%), radial-gradient(circle at 75% 80%, rgba(102,126,234,0.3), transparent 55%)' }}
                />
                <div className="relative z-10">
                  <h3 className="font-sora font-extrabold text-[clamp(24px,3.5vw,36px)] text-white mb-4">
                    {diagnosticoCopy.ctaFinal.titulo}
                  </h3>
                  <p className="text-[#bae6fd] mb-3">{diagnosticoCopy.ctaFinal.texto}</p>
                  <p className="text-[#7dd3fc] text-sm mb-8">
                    Ponto de partida sugerido:{' '}
                    <span className="text-white font-semibold">{servicoRecomendado.titulo}</span> — {servicoRecomendado.resumo}
                  </p>
                  <div className="flex justify-center">
                    <BrilhoButton href={buildWhatsappUrl(resultado)} label={diagnosticoCopy.ctaFinal.cta} target="_blank" />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
