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
  dominio?: string
  nota?: number
}

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[#0a2540] placeholder:text-slate-400 focus:border-[#0099ff] focus:ring-2 focus:ring-[#0099ff]/20 outline-none transition-all'

/** Formata dígitos como (DD) 9999-9999 ou (DD) 99999-9999 conforme o usuário digita */
function formatWhatsapp(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function isValidWhatsapp(value: string) {
  const d = value.replace(/\D/g, '')
  if (d.length < 10 || d.length > 11) return false
  const ddd = Number(d.slice(0, 2))
  if (ddd < 11 || ddd > 99) return false
  // Celular (11 dígitos) começa com 9 depois do DDD
  if (d.length === 11 && d[2] !== '9') return false
  return true
}

export function LeadForm({ onUnlock, dominio, nota }: Props) {
  const [whatsapp, setWhatsapp] = useState('')
  const [whatsappErro, setWhatsappErro] = useState(false)

  function handleWhatsappChange(e: React.ChangeEvent<HTMLInputElement>) {
    setWhatsapp(formatWhatsapp(e.target.value))
    if (whatsappErro) setWhatsappErro(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!isValidWhatsapp(whatsapp)) {
      setWhatsappErro(true)
      return
    }

    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') || '').trim()
    const email = String(data.get('email') || '').trim()

    trackLeadClick('diagnostico')
    pushEvent('diagnostico_lead', { name, whatsapp, email })

    // Persistência no servidor — não bloqueia o desbloqueio do relatório;
    // keepalive garante o envio mesmo se o usuário navegar em seguida
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, whatsapp, email: email || undefined, dominio, nota, origem: 'diagnostico' }),
      keepalive: true,
    }).catch(() => {})

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

      <div>
        <input
          name="whatsapp"
          type="tel"
          inputMode="numeric"
          required
          value={whatsapp}
          onChange={handleWhatsappChange}
          placeholder={diagnosticoCopy.gate.whatsappPlaceholder}
          aria-invalid={whatsappErro}
          className={`${inputClass} ${whatsappErro ? '!border-red-400 !ring-2 !ring-red-400/20' : ''}`}
        />
        {whatsappErro && (
          <p className="text-red-500 text-xs mt-1.5 font-medium">{diagnosticoCopy.gate.whatsappErro}</p>
        )}
      </div>

      <input name="email" type="email" placeholder="Seu e-mail (opcional)" className={inputClass} />

      <button
        type="submit"
        className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#0099ff] to-[#667eea] hover:brightness-110 hover:shadow-[0_8px_24px_-6px_rgba(0,153,255,0.5)] transition-all"
      >
        {diagnosticoCopy.gate.cta}
      </button>
    </form>
  )
}
