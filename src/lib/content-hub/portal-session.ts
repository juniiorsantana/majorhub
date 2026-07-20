import { createHmac, timingSafeEqual } from 'crypto'
import { getSupabaseAdminConfig } from '@/lib/supabase/admin'

export const PORTAL_SESSION_COOKIE = 'mh_portal_session'
export const PORTAL_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

export interface PortalSession {
  clientId: string
  slug: string
  email: string
  exp: number
}

function signingKey() {
  return getSupabaseAdminConfig().serviceRoleKey
}

function signature(payload: string) {
  return createHmac('sha256', signingKey()).update(payload).digest('base64url')
}

export function createPortalSession(clientId: string, slug: string, email: string) {
  const payload: PortalSession = {
    clientId,
    slug,
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + PORTAL_SESSION_TTL_SECONDS,
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encoded}.${signature(encoded)}`
}

export function verifyPortalSession(value?: string | null): PortalSession | null {
  if (!value) return null
  const [encoded, receivedSignature] = value.split('.')
  if (!encoded || !receivedSignature) return null

  const expected = signature(encoded)
  const left = Buffer.from(receivedSignature)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as PortalSession
    if (!payload.clientId || !payload.slug || !payload.email || payload.exp <= Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export function portalCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: PORTAL_SESSION_TTL_SECONDS,
  }
}
