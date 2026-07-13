'use client'
import { useState } from 'react'
import { trackLeadClick, pushEvent } from '@/lib/analytics'
import { diagnosticoCopy } from '@/content/diagnostico-copy'

interface LeadData {
  name: string
  whatsapp: string
  email?: string
}

interface Props {
  onUnlock: (data: LeadData) => void
}

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[#0a2540] placeholder:text-slate-400 focus:border-[#0099ff] focus:ring-2 focus:ring-[#0099ff]/20 outline-none transition-all'

export function LeadForm({ onUnlock }: Props) {
  const [enviando, setEnviando] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEnviando(true)

    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') || '').trim()
    const whatsapp = String(data.get('whatsapp') || '').trim()
    const email = String(data.get('email') || '').trim()

    trackLeadClick('diagnostico')
    pushEvent('diagnostico_lead', { name, whatsapp, email })

    onUnlock({ name, whatsapp, email: email || undefined })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white border border-slate-200 shadow-[0_16px_48px_-20px_rgba(10,37,64,0.25)] p-6 md:p-8 space-y-4"
    >
      <div>
        <h4 className="font-sora font-bold text-[#0a2540] text-lg mb-1">{diagnosticoCopy.gate.titulo}</h4>
        <p className="text-slate-500 text-sm">{diagnosticoCopy.gate.texto}</p>
      </div>

      <input name="name" required placeholder={diagnosticoCopy.gate.nomePlaceholder} className={inputClass} />
      <input
        name="whatsapp"
        type="tel"
        required
        placeholder={diagnosticoCopy.gate.whatsappPlaceholder}
        className={inputClass}
      />
      <input name="email" type="email" placeholder="Seu e-mail (opcional)" className={inputClass} />

      <button
        type="submit"
        disabled={enviando}
        className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#0099ff] to-[#667eea] hover:brightness-110 hover:shadow-[0_8px_24px_-6px_rgba(0,153,255,0.5)] transition-all disabled:opacity-60"
      >
        {diagnosticoCopy.gate.cta}
      </button>
    </form>
  )
}
