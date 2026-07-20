'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface PostFormData {
  title: string
  seo_title: string
  description: string
  slug: string
  author: string
  date: string
  lastmod: string
  category: string
  tags: string
  draft: boolean
  content: string
}

interface PostEditorProps {
  initialData?: Partial<PostFormData>
  mode: 'create' | 'edit'
  originalSlug?: string
}

const CATEGORIES = [
  'Automação, IA e Vendas',
  'WhatsApp & API',
  'Marketing de Performance',
  'CRM & Dados',
  'Estratégia Digital',
  'Cases e Resultados',
]

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function today() {
  return new Date().toISOString().split('T')[0]
}

export default function PostEditor({ initialData, mode, originalSlug }: PostEditorProps) {
  const router = useRouter()
  const [tab, setTab] = useState<'editor' | 'preview'>('editor')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState<PostFormData>({
    title: initialData?.title ?? '',
    seo_title: initialData?.seo_title ?? '',
    description: initialData?.description ?? '',
    slug: initialData?.slug ?? '',
    author: initialData?.author ?? 'MAJOR',
    date: initialData?.date ?? today(),
    lastmod: initialData?.lastmod ?? today(),
    category: initialData?.category ?? CATEGORIES[0],
    tags: Array.isArray(initialData?.tags)
      ? (initialData.tags as string[]).join(', ')
      : (initialData?.tags as string) ?? '',
    draft: initialData?.draft ?? false,
    content: initialData?.content ?? '',
  })

  const set = (field: keyof PostFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value

    setForm(prev => {
      const next = { ...prev, [field]: value }
      // Auto-gera slug ao digitar o título
      if (field === 'title' && mode === 'create') {
        next.slug = slugify(value as string)
      }
      return next
    })
  }

  const insertMarkdown = useCallback((prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('md-content') as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = form.content.substring(start, end)
    const newContent =
      form.content.substring(0, start) +
      prefix + selected + suffix +
      form.content.substring(end)
    setForm(prev => ({ ...prev, content: newContent }))
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }, [form.content])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const tags = form.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      const payload = {
        title: form.title,
        seo_title: form.seo_title || form.title,
        description: form.description,
        slug: form.slug,
        author: form.author,
        date: form.date,
        lastmod: today(),
        category: form.category,
        tags,
        draft: form.draft,
        content: form.content,
      }

      const url = mode === 'create'
        ? '/api/admin/blog'
        : `/api/admin/blog/${originalSlug}`

      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao salvar.')
        return
      }

      setSuccess(mode === 'create' ? 'Post criado com sucesso!' : 'Post atualizado com sucesso!')

      if (mode === 'create') {
        setTimeout(() => router.push('/admin/blog'), 1200)
      } else {
        // Atualiza o slug na URL se mudou
        if (data.slug !== originalSlug) {
          router.replace(`/admin/blog/${data.slug}/edit`)
        }
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(0,229,255,0.12)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#e0e7ff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    color: '#7dd3fc',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    display: 'block',
    marginBottom: '6px',
  }

  const sectionStyle: React.CSSProperties = {
    background: 'rgba(10,37,64,0.4)',
    border: '1px solid rgba(0,229,255,0.08)',
    borderRadius: '14px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }

  return (
    <form onSubmit={handleSave}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#e0e7ff', fontFamily: 'var(--font-sora, sans-serif)', marginBottom: '4px' }}>
            {mode === 'create' ? 'Novo Post' : 'Editar Post'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            {mode === 'create' ? 'Crie um novo artigo para o Blog' : `Editando: ${form.title || originalSlug}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Draft toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.draft}
              onChange={e => setForm(p => ({ ...p, draft: e.target.checked }))}
              style={{ width: '16px', height: '16px', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
            <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 600 }}>Rascunho</span>
          </label>

          <button
            type="button"
            onClick={() => router.push('/admin/blog')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(0,0,0,0.2)',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              border: 'none',
              background: saving ? 'rgba(0,153,255,0.3)' : 'linear-gradient(135deg, #0099ff, #667eea)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: saving ? 'none' : '0 4px 16px rgba(0,153,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {saving && (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            )}
            {saving ? 'Salvando...' : mode === 'create' ? 'Publicar Post' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px', marginBottom: '20px' }}>
          ⚠ {error}
        </div>
      )}
      {success && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '10px', padding: '12px 16px', color: '#86efac', fontSize: '13px', marginBottom: '20px' }}>
          ✓ {success}
        </div>
      )}

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
        {/* Left — Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Title */}
          <div style={sectionStyle}>
            <div>
              <label style={labelStyle}>Título</label>
              <input
                required
                type="text"
                value={form.title}
                onChange={set('title')}
                placeholder="Título do artigo"
                style={{ ...inputStyle, fontSize: '18px', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={labelStyle}>SEO Title <span style={{ color: '#334155', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(deixe vazio para usar o título)</span></label>
              <input
                type="text"
                value={form.seo_title}
                onChange={set('seo_title')}
                placeholder={form.title || 'Título para SEO'}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Descrição / Resumo</label>
              <textarea
                required
                value={form.description}
                onChange={set('description')}
                placeholder="Resumo do artigo (aparece na listagem e no SEO)"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
              />
            </div>
          </div>

          {/* Content Editor */}
          <div style={{ background: 'rgba(10,37,64,0.4)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,229,255,0.08)', padding: '0 4px' }}>
              {(['editor', 'preview'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  style={{
                    padding: '12px 20px',
                    border: 'none',
                    background: 'transparent',
                    color: tab === t ? '#0099ff' : '#475569',
                    fontWeight: tab === t ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    borderBottom: `2px solid ${tab === t ? '#0099ff' : 'transparent'}`,
                    transition: 'all 0.15s',
                    marginBottom: '-1px',
                  }}
                >
                  {t === 'editor' ? '✏️ Editor' : '👁️ Preview'}
                </button>
              ))}
            </div>

            {tab === 'editor' && (
              <>
                {/* Toolbar */}
                <div style={{ display: 'flex', gap: '4px', padding: '8px 12px', borderBottom: '1px solid rgba(0,229,255,0.06)', flexWrap: 'wrap' }}>
                  {[
                    { label: 'B', title: 'Negrito', action: () => insertMarkdown('**', '**') },
                    { label: 'I', title: 'Itálico', action: () => insertMarkdown('_', '_') },
                    { label: '# H1', title: 'Título H1', action: () => insertMarkdown('\n# ', '') },
                    { label: '## H2', title: 'Título H2', action: () => insertMarkdown('\n## ', '') },
                    { label: '### H3', title: 'Título H3', action: () => insertMarkdown('\n### ', '') },
                    { label: '> Quote', title: 'Citação', action: () => insertMarkdown('\n> ', '') },
                    { label: '— Lista', title: 'Lista', action: () => insertMarkdown('\n- ', '') },
                    { label: '`Code`', title: 'Código inline', action: () => insertMarkdown('`', '`') },
                    { label: '```Bloco', title: 'Bloco de código', action: () => insertMarkdown('\n```\n', '\n```') },
                    { label: '---', title: 'Divisor', action: () => insertMarkdown('\n\n---\n\n', '') },
                  ].map(btn => (
                    <button
                      key={btn.label}
                      type="button"
                      title={btn.title}
                      onClick={btn.action}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(0,0,0,0.2)',
                        color: '#7dd3fc',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  id="md-content"
                  required
                  value={form.content}
                  onChange={set('content')}
                  placeholder="# Título do artigo&#10;&#10;Escreva o conteúdo aqui em Markdown..."
                  style={{
                    width: '100%',
                    minHeight: '520px',
                    background: 'transparent',
                    border: 'none',
                    color: '#bae6fd',
                    fontSize: '14px',
                    lineHeight: '1.8',
                    padding: '20px',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
                    boxSizing: 'border-box',
                  }}
                />
              </>
            )}

            {tab === 'preview' && (
              <div
                style={{
                  padding: '24px',
                  minHeight: '520px',
                  color: '#bae6fd',
                  fontSize: '15px',
                  lineHeight: '1.8',
                }}
              >
                {form.content ? (
                  <div
                    className="prose-admin"
                    dangerouslySetInnerHTML={{
                      __html: simpleMarkdown(form.content),
                    }}
                  />
                ) : (
                  <p style={{ color: '#334155', fontStyle: 'italic' }}>Nenhum conteúdo para visualizar.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right — Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Slug */}
          <div style={sectionStyle}>
            <div>
              <label style={labelStyle}>Slug (URL)</label>
              <input
                required
                type="text"
                value={form.slug}
                onChange={set('slug')}
                placeholder="meu-artigo-sobre-ia"
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '13px' }}
              />
              {form.slug && (
                <div style={{ marginTop: '6px', color: '#334155', fontSize: '11px', wordBreak: 'break-all' }}>
                  /blog/<span style={{ color: '#0099ff' }}>{form.slug}</span>
                </div>
              )}
            </div>
          </div>

          {/* Publication */}
          <div style={sectionStyle}>
            <div>
              <label style={labelStyle}>Data de Publicação</label>
              <input
                type="date"
                value={form.date}
                onChange={set('date')}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Categoria</label>
              <select value={form.category} onChange={set('category')} style={inputStyle}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tags <span style={{ color: '#334155', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(separadas por vírgula)</span></label>
              <input
                type="text"
                value={form.tags}
                onChange={set('tags')}
                placeholder="WhatsApp API, automação, IA"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Autor</label>
              <input
                type="text"
                value={form.author}
                onChange={set('author')}
                placeholder="MAJOR"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Word count */}
          <div style={{ ...sectionStyle, gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '13px' }}>
              <span>Palavras</span>
              <span style={{ color: '#7dd3fc', fontWeight: 600 }}>
                {form.content.trim() ? form.content.trim().split(/\s+/).length : 0}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '13px' }}>
              <span>Tempo de leitura</span>
              <span style={{ color: '#7dd3fc', fontWeight: 600 }}>
                {Math.max(1, Math.round((form.content.trim().split(/\s+/).length || 0) / 200))} min
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '13px' }}>
              <span>Caracteres</span>
              <span style={{ color: '#7dd3fc', fontWeight: 600 }}>
                {form.content.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

// Simple Markdown → HTML converter para preview
function simpleMarkdown(md: string): string {
  const html = md
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks
    .replace(/```[\s\S]*?```/g, m => `<pre style="background:rgba(0,0,0,0.4);padding:16px;border-radius:8px;overflow-x:auto;margin:16px 0"><code>${m.slice(3, -3).replace(/^\w+\n/, '')}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.4);padding:2px 6px;border-radius:4px;font-family:monospace">$1</code>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 style="color:#e0e7ff;font-size:18px;font-weight:700;margin:24px 0 8px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#e0e7ff;font-size:22px;font-weight:700;margin:32px 0 12px;padding-bottom:8px;border-bottom:1px solid rgba(0,229,255,0.1)">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:#e0e7ff;font-size:28px;font-weight:800;margin:0 0 16px">$1</h1>')
    // Blockquote
    .replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:3px solid #0099ff;padding:4px 16px;margin:16px 0;color:#7dd3fc">$1</blockquote>')
    // Bold / Italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#e0e7ff">$1</strong>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li style="margin:4px 0">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul style="padding-left:20px;margin:12px 0">${m}</ul>`)
    // HR
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(0,229,255,0.1);margin:24px 0"/>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p style="margin:12px 0">')

  return `<p style="margin:12px 0">${html}</p>`
}
