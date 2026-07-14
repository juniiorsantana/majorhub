import { NextRequest, NextResponse } from 'next/server'

interface LeadPayload {
  name?: string
  whatsapp?: string
  email?: string
  dominio?: string
  nota?: number
  origem?: string
}

export async function POST(req: NextRequest) {
  let body: LeadPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ erro: 'Requisição inválida' }, { status: 400 })
  }

  const name = String(body.name || '').trim().slice(0, 120)
  const whatsapp = String(body.whatsapp || '').replace(/\D/g, '').slice(0, 13)
  const email = String(body.email || '').trim().slice(0, 160)

  if (!name || whatsapp.length < 10) {
    return NextResponse.json({ erro: 'Nome e WhatsApp são obrigatórios' }, { status: 400 })
  }

  const lead = {
    name,
    whatsapp,
    email: email || undefined,
    dominio: body.dominio ? String(body.dominio).slice(0, 200) : undefined,
    nota: typeof body.nota === 'number' ? body.nota : undefined,
    origem: body.origem ? String(body.origem).slice(0, 60) : 'diagnostico',
    recebidoEm: new Date().toISOString(),
  }

  // Registro garantido nos logs do servidor (visível no painel da Vercel),
  // mesmo que o webhook falhe ou não esteja configurado
  console.log('[lead]', JSON.stringify(lead))

  const webhookUrl = process.env.LEAD_WEBHOOK_URL
  if (webhookUrl) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
        signal: controller.signal,
      })
      clearTimeout(timer)
      if (!res.ok) console.error('[lead] webhook respondeu', res.status)
    } catch (err) {
      console.error('[lead] falha ao enviar pro webhook:', err)
    }
  }

  return NextResponse.json({ ok: true })
}
