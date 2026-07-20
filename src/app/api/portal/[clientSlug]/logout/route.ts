import { NextResponse } from 'next/server'
import { PORTAL_SESSION_COOKIE, portalCookieOptions } from '@/lib/content-hub/portal-session'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(PORTAL_SESSION_COOKIE, '', { ...portalCookieOptions(), maxAge: 0 })
  return response
}
