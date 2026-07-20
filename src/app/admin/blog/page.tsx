'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'


interface PostMeta {
  filename: string
  title: string
  slug: string
  description: string
  date: string
  category: string
  tags: string[]
  draft: boolean
  author: string
  readingTime: number
  wordCount: number
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminBlogPage() {

  const [posts, setPosts] = useState<PostMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/blog')
    const data = await res.json()
    setPosts(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  async function handleDelete(slug: string) {
    if (confirmDelete !== slug) {
      setConfirmDelete(slug)
      return
    }
    setDeletingSlug(slug)
    setConfirmDelete(null)
    try {
      const res = await fetch(`/api/admin/blog/${slug}`, { method: 'DELETE' })
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.slug !== slug))
      }
    } finally {
      setDeletingSlug(null)
    }
  }

  const filtered = posts
    .filter(p => {
      if (filter === 'published') return !p.draft
      if (filter === 'draft') return p.draft
      return true
    })
    .filter(p =>
      search.length === 0 ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#e0e7ff', fontFamily: 'var(--font-sora, sans-serif)', marginBottom: '4px' }}>
            Blog
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {posts.length} post{posts.length !== 1 ? 's' : ''} no total
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0099ff, #667eea)',
            color: 'white',
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(0,153,255,0.3)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          Novo Post
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }}
          >
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 38px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(0,229,255,0.12)',
              borderRadius: '10px',
              color: '#e0e7ff',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter buttons */}
        {(['all', 'published', 'draft'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              border: '1px solid',
              borderColor: filter === f ? 'rgba(0,153,255,0.4)' : 'rgba(255,255,255,0.06)',
              background: filter === f ? 'rgba(0,153,255,0.1)' : 'rgba(0,0,0,0.2)',
              color: filter === f ? '#0099ff' : '#64748b',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {f === 'all' ? 'Todos' : f === 'published' ? 'Publicados' : 'Rascunhos'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
          <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 12px' }}>
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#0099ff" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          Carregando posts...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
          {search ? `Nenhum post encontrado para "${search}"` : 'Nenhum post ainda.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(post => (
            <div
              key={post.slug}
              style={{
                background: 'rgba(10,37,64,0.4)',
                border: '1px solid rgba(0,229,255,0.08)',
                borderRadius: '14px',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,229,255,0.2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,229,255,0.08)' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: '100px',
                      background: post.draft ? 'rgba(245,158,11,0.1)' : 'rgba(0,153,255,0.1)',
                      color: post.draft ? '#f59e0b' : '#0099ff',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {post.draft ? 'Rascunho' : 'Publicado'}
                  </span>
                  <span style={{ color: '#334155', fontSize: '12px' }}>{post.category}</span>
                  <span style={{ color: '#1e293b' }}>·</span>
                  <span style={{ color: '#334155', fontSize: '12px' }}>{formatDate(post.date)}</span>
                  <span style={{ color: '#1e293b' }}>·</span>
                  <span style={{ color: '#334155', fontSize: '12px' }}>{post.readingTime} min</span>
                </div>

                <h2
                  style={{ color: '#e0e7ff', fontSize: '16px', fontWeight: 700, marginBottom: '4px', lineHeight: 1.4 }}
                  className="line-clamp-1"
                >
                  {post.title}
                </h2>
                <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.5 }} className="line-clamp-2">
                  {post.description}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  title="Ver no site"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#475569',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    textDecoration: 'none',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </Link>

                <Link
                  href={`/admin/blog/${post.slug}/edit`}
                  title="Editar"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0099ff',
                    background: 'rgba(0,153,255,0.08)',
                    border: '1px solid rgba(0,153,255,0.15)',
                    textDecoration: 'none',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>

                <button
                  onClick={() => handleDelete(post.slug)}
                  disabled={deletingSlug === post.slug}
                  title={confirmDelete === post.slug ? 'Clique para confirmar exclusão' : 'Excluir'}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: confirmDelete === post.slug ? '#fff' : '#ef4444',
                    background: confirmDelete === post.slug ? 'rgba(239,68,68,0.7)' : 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {deletingSlug === post.slug ? (
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  ) : confirmDelete === post.slug ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Click outside to cancel confirm */}
      {confirmDelete && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: -1 }}
          onClick={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
