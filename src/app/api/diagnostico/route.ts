import { NextRequest, NextResponse } from 'next/server'
import { analyzeSite } from '@/lib/diagnostico/analyze'
import { montarResultado } from '@/lib/diagnostico/score'

export async function POST(req: NextRequest) {
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

  const audit = await analyzeSite(url)
  if (!audit.fetchOk) {
    return NextResponse.json({ erro: audit.erro || 'Não foi possível acessar o site' }, { status: 422 })
  }

  const resultado = montarResultado(url, audit)

  return NextResponse.json(resultado)
}
