import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, SupabaseAdminConfigError } from '@/lib/supabase/admin'

// Precisa bater no banco toda vez: nada de cache nem de resposta estática.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function autorizado(header: string | null, secret: string) {
  if (!header) return false
  const enviado = Buffer.from(header)
  const esperado = Buffer.from(`Bearer ${secret}`)
  return enviado.length === esperado.length && timingSafeEqual(enviado, esperado)
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    console.error('[keep-alive] CRON_SECRET ausente no servidor')
    return NextResponse.json({ error: 'CRON_SECRET não configurado.' }, { status: 500 })
  }

  if (!autorizado(request.headers.get('authorization'), secret)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  let supabase
  try {
    supabase = createAdminClient()
  } catch (err) {
    if (err instanceof SupabaseAdminConfigError) {
      console.error('[keep-alive] Supabase mal configurado:', err.code)
      return NextResponse.json({ error: `Supabase mal configurado: ${err.code}` }, { status: 503 })
    }
    throw err
  }

  const { data, error } = await supabase.rpc('touch_keep_alive', { ping_source: 'vercel-cron' })

  if (error) {
    // Falha silenciosa aqui significa projeto pausado daqui a alguns dias,
    // então o erro precisa aparecer nos logs da Vercel.
    console.error('[keep-alive] ping falhou:', error.message)
    return NextResponse.json({ error: 'Ping no Supabase falhou.' }, { status: 502 })
  }

  const ping = data as { last_ping_at: string; ping_count: number } | null
  console.log('[keep-alive] ok', ping?.last_ping_at, '#', ping?.ping_count)

  return NextResponse.json(
    { ok: true, lastPingAt: ping?.last_ping_at ?? null, pingCount: ping?.ping_count ?? null },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
