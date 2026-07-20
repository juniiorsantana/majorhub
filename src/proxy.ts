import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const LOGIN_PATH = '/admin/login'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLogin = pathname === LOGIN_PATH
  const isAuthApi = pathname === '/api/admin/auth'
  const { response, user, isAdmin, configured } = await updateSession(request)

  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'no-referrer')

  if (!configured && !isLogin && !isAuthApi) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 })
    const loginUrl = new URL(LOGIN_PATH, request.url)
    loginUrl.searchParams.set('config', 'missing')
    return NextResponse.redirect(loginUrl)
  }
  if (!user && !isLogin && !isAuthApi) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    const loginUrl = new URL(LOGIN_PATH, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  if (user && !isAdmin && !isLogin && !isAuthApi) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
    const loginUrl = new URL(LOGIN_PATH, request.url)
    loginUrl.searchParams.set('error', 'forbidden')
    return NextResponse.redirect(loginUrl)
  }
  if (user && isAdmin && isLogin) return NextResponse.redirect(new URL('/admin', request.url))
  return response
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] }
