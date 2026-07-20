import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPortalSession, PORTAL_SESSION_COOKIE, portalCookieOptions } from '@/lib/content-hub/portal-session'

const schema = z.object({ email: z.string().trim().email().max(180) })
const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

function attemptKey(request: NextRequest, slug: string) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  return `${slug}:${ip}`
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ clientSlug: string }> }) {
  const { clientSlug } = await params
  const key = attemptKey(request, clientSlug)
  const now = Date.now()
  const current = attempts.get(key)
  if (current && current.resetAt > now && current.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, { status: 429 })
  }

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 })

  try {
    const admin = createAdminClient()
    const email = parsed.data.email.toLowerCase()
    const { data: client } = await admin.from('clients').select('id, portal_slug').eq('portal_slug', clientSlug.toLowerCase()).maybeSingle()
    let authorized = false
    if (client) {
      const { data: approver } = await admin.from('client_approvers').select('id').eq('client_id', client.id).eq('active', true).ilike('email', email).maybeSingle()
      authorized = Boolean(approver)
    }

    if (!client || !authorized) {
      const nextAttempt = current && current.resetAt > now ? { count: current.count + 1, resetAt: current.resetAt } : { count: 1, resetAt: now + WINDOW_MS }
      attempts.set(key, nextAttempt)
      return NextResponse.json({ error: 'Este e-mail não possui acesso ao portal.' }, { status: 403 })
    }

    attempts.delete(key)
    const response = NextResponse.json({ ok: true })
    response.cookies.set(PORTAL_SESSION_COOKIE, createPortalSession(client.id, client.portal_slug, email), portalCookieOptions())
    return response
  } catch (cause) {
    console.error('[portal/login]', cause)
    return NextResponse.json({ error: 'O portal ainda não está configurado no servidor.' }, { status: 503 })
  }
}
