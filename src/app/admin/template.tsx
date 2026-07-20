'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'
  const isContentHub = pathname.startsWith('/admin/clientes')

  return (
    <>
      {children}
      {!isLogin && !isContentHub && (
        <Link
          href="/admin/clientes"
          aria-label="Abrir Clientes e Posts"
          style={{
            alignItems: 'center',
            background: '#2878ff',
            border: '1px solid rgba(255,255,255,.2)',
            borderRadius: 13,
            bottom: 22,
            boxShadow: '0 12px 35px rgba(0,0,0,.36)',
            color: 'white',
            display: 'flex',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: 12,
            fontWeight: 750,
            gap: 9,
            minHeight: 44,
            padding: '0 16px',
            position: 'fixed',
            right: 22,
            textDecoration: 'none',
            zIndex: 45,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Clientes & Posts
        </Link>
      )}
    </>
  )
}
