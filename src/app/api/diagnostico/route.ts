import { NextRequest, NextResponse } from 'next/server'
import { analyzeSite } from '@/lib/diagnostico/analyze'
import { montarResultado } from '@/lib/diagnostico/score'

export const maxDuration = 30

// Rate limit em memória (por instância serverless — imperfeito, mas barra abuso básico)
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 5
const hits = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  // Evita crescimento sem limite do Map
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every(t => now - t >= RATE_WINDOW_MS)) hits.delete(key)
    }
  }
  return false
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconhecido'
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { erro: 'Muitas análises em sequência. Aguarde um minuto e tente novamente.' },
      { status: 429 }
    )
  }

  let body: { url?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ erro: 'Requisição inválida' }, { status: 400 })
  }

  const url = body.url?.trim()
  if (!url) {
    return NextResponse.json({ erro: 'Informe uma URL' }, { status: 400 })
  }
  if (url.length > 200) {
    return NextResponse.json({ erro: 'URL muito longa' }, { status: 400 })
  }

  const audit = await analyzeSite(url)
  if (!audit.fetchOk) {
    return NextResponse.json({ erro: audit.erro || 'Não foi possível acessar o site' }, { status: 422 })
  }

  const resultado = montarResultado(url, audit)

  return NextResponse.json(resultado)
}
