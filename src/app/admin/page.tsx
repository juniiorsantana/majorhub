import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPostsAdmin } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Dashboard — Admin MajorHub',
  robots: { index: false, follow: false },
}

export default function AdminDashboard() {
  const allPosts = getAllPostsAdmin()
  const publishedPosts = allPosts.filter(p => !p.draft)
  const draftPosts = allPosts.filter(p => p.draft)
  const lastPost = publishedPosts[0]

  const stats = [
    {
      label: 'Posts Publicados',
      value: publishedPosts.length,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
      color: '#0099ff',
      bg: 'rgba(0,153,255,0.08)',
      border: 'rgba(0,153,255,0.15)',
    },
    {
      label: 'Rascunhos',
      value: draftPosts.length,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.15)',
    },
    {
      label: 'Total de Posts',
      value: allPosts.length,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
          <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
          <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
          <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        </svg>
      ),
      color: '#667eea',
      bg: 'rgba(102,126,234,0.08)',
      border: 'rgba(102,126,234,0.15)',
    },
  ]

  const quickActions = [
    { href: '/admin/blog/new', label: 'Novo Post', description: 'Criar um artigo para o Blog', color: '#0099ff', icon: '✍️' },
    { href: '/admin/blog', label: 'Gerenciar Blog', description: 'Ver todos os posts', color: '#667eea', icon: '📝' },
    { href: '/blog', label: 'Ver Blog', description: 'Abrir blog no site', color: '#00e5ff', icon: '🌐', external: true },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#e0e7ff',
            fontFamily: 'var(--font-sora, sans-serif)',
            marginBottom: '6px',
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Bem-vindo à área administrativa da MajorHub
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {stats.map(stat => (
          <div
            key={stat.label}
            style={{
              background: stat.bg,
              border: `1px solid ${stat.border}`,
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ color: stat.color }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#e0e7ff', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Quick Actions + Last Post */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Quick Actions */}
        <div
          style={{
            background: 'rgba(10,37,64,0.5)',
            border: '1px solid rgba(0,229,255,0.08)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <h2 style={{ color: '#bae6fd', fontSize: '14px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Ações rápidas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quickActions.map(action => (
              <Link
                key={action.href}
                href={action.href}
                target={action.external ? '_blank' : undefined}
                className="admin-quick-action"
              >
                <span style={{ fontSize: '20px' }}>{action.icon}</span>
                <div>
                  <div style={{ color: '#e0e7ff', fontSize: '14px', fontWeight: 600 }}>{action.label}</div>
                  <div style={{ color: '#475569', fontSize: '12px' }}>{action.description}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: '#334155', fontSize: '16px' }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Last Post */}
        <div
          style={{
            background: 'rgba(10,37,64,0.5)',
            border: '1px solid rgba(0,229,255,0.08)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <h2 style={{ color: '#bae6fd', fontSize: '14px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Último post publicado
          </h2>
          {lastPost ? (
            <div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  background: 'rgba(0,153,255,0.1)',
                  color: '#0099ff',
                  fontSize: '11px',
                  fontWeight: 600,
                  marginBottom: '10px',
                }}
              >
                {lastPost.category}
              </span>
              <h3 style={{ color: '#e0e7ff', fontSize: '16px', fontWeight: 700, lineHeight: 1.4, marginBottom: '8px' }}>
                {lastPost.title}
              </h3>
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
                {lastPost.description}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link
                  href={`/admin/blog/${lastPost.slug}/edit`}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(0,153,255,0.1)',
                    border: '1px solid rgba(0,153,255,0.2)',
                    color: '#0099ff',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Editar
                </Link>
                <Link
                  href={`/blog/${lastPost.slug}`}
                  target="_blank"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Ver no site →
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ color: '#475569', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
              Nenhum post publicado ainda.{' '}
              <Link href="/admin/blog/new" style={{ color: '#0099ff', textDecoration: 'underline' }}>
                Criar o primeiro!
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
