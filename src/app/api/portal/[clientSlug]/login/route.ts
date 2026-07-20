import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, SupabaseAdminConfigError } from '@/lib/supabase/admin'
import { createPortalSession, PORTAL_SESSION_COOKIE, portalCookieOptions } from '@/lib/content-hub/portal-session'

const schema = z.object({ email: z.string().trim().email().max(180) })
const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

function attemptKey(request: NextRequest, slug: string) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  return `${slug}:${ip}`
}

function portalConfigurationError(cause: unknown) {
  if (cause instanceof SupabaseAdminConfigError) {
    if (cause.code === 'missing_service_role_key') {
      return 'A variável SUPABASE_SERVICE_ROLE_KEY não está disponível neste deployment da Vercel.'
    }
    if (cause.code === 'missing_url') {
      return 'A variável NEXT_PUBLIC_SUPABASE_URL não está disponível neste deployment da Vercel.'
    }
    return 'A URL configurada para o Supabase é inválida.'
  }

  const error = cause as { code?: string; message?: string }
  if (error?.code === '42P01' || error?.code === 'PGRST205') {
    return 'As tabelas do portal ainda não existem no projeto Supabase usado pela produção.'
  }
  if (error?.code === 'PGRST301' || /invalid.+(jwt|key)|jwt.+invalid/i.test(error?.message ?? '')) {
    return 'A SUPABASE_SERVICE_ROLE_KEY configurada na Vercel foi rejeitada pelo Supabase.'
  }
  return 'Não foi possível conectar o portal ao Supabase. Confira as variáveis deste deployment.'
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ clientSlug: string }> }) {
  const { clientSlug } = await params
  const key = attemptKey(request, clientSlug)
  const now = Date.now()
  const current = attempts.get(key)
  if (current && current.resetAt > now && current.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 })

  try {
    const admin = createAdminClient()
    const email = parsed.data.email.toLowerCase()
    const { data: client, error: clientError } = await admin.from('clients').select('id, portal_slug').eq('portal_slug', clientSlug.toLowerCase()).maybeSingle()
    if (clientError) throw clientError

    let authorized = false
    if (client) {
      const { data: approver, error: approverError } = await admin.from('client_approvers').select('id').eq('client_id', client.id).eq('active', true).ilike('email', email).maybeSingle()
      if (approverError) throw approverError
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
    return NextResponse.json({ error: portalConfigurationError(cause) }, { status: 503 })
  }
}
