'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedRedirect = searchParams.get('redirect')
  const redirect = requestedRedirect?.startsWith('/admin') && !requestedRedirect.startsWith('//')
    ? requestedRedirect
    : '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao fazer login.')
        setLoading(false)
        return
      }

      router.push(redirect)
      router.refresh()
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#000d1a]">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 30% 20%, rgba(0,153,255,0.12), transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(102,126,234,0.10), transparent 60%)
          `,
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md mx-4"
        style={{
          background: 'rgba(10, 37, 64, 0.7)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(0,229,255,0.15)',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 32px 80px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,255,0.05) inset',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #0099ff, #667eea)',
              boxShadow: '0 8px 32px rgba(0,153,255,0.4)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: 'var(--font-sora, sans-serif)', color: '#e0e7ff' }}
          >
            MajorHub Admin
          </h1>
          <p style={{ color: '#7dd3fc', fontSize: '14px' }}>
            Acesse a área administrativa
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* E-mail */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              style={{ color: '#bae6fd', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@majorhub.com.br"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(0,229,255,0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#e0e7ff',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s',
                width: '100%',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,229,255,0.5)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(0,229,255,0.2)' }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              style={{ color: '#bae6fd', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(0,229,255,0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#e0e7ff',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s',
                width: '100%',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,229,255,0.5)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(0,229,255,0.2)' }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#fca5a5',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>⚠</span> {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading
                ? 'rgba(0,153,255,0.3)'
                : 'linear-gradient(135deg, #0099ff, #667eea)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              color: 'white',
              fontSize: '15px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginTop: '4px',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(0,153,255,0.35)',
              fontFamily: 'var(--font-inter, sans-serif)',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-8" style={{ color: '#475569', fontSize: '12px' }}>
          Área restrita — MajorHub © {new Date().getFullYear()}
        </p>
      </div>
    </main>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#000d1a]" />}>
      <LoginForm />
    </Suspense>
  )
}
