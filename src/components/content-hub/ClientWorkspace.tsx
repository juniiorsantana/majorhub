'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { ContentCalendar, ContentClient, ContentPost, PostStatus } from '@/lib/content-hub/types'
import { CALENDAR_STATUS_LABELS, POST_STATUS_LABELS } from '@/lib/content-hub/types'
import styles from './ContentHub.module.css'

interface PortalInfo {
  portal_slug: string
  portal_url: string
  approvers: Array<{ id: string; email: string; name: string | null; active: boolean }>
  batches: Array<{ id: string; calendar_id: string | null; title: string; slug: string; status: 'draft' | 'open' | 'closed' | 'archived'; published_at: string | null; approval_batch_posts?: Array<{ count: number }> }>
}

function initials(name: string) { return name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() }
function statusClass(status: PostStatus) {
  if (status === 'pending_review') return styles.statusPending
  if (status === 'changes_requested') return styles.statusChanges
  if (status === 'approved') return styles.statusApproved
  if (status === 'published') return styles.statusPublished
  if (status === 'in_progress') return styles.statusProgress
  return styles.statusDraft
}
function formatDate(value?: string | null) { return value ? new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sem data' }

function PostRows({ posts, clientId }: { posts: ContentPost[]; clientId: string }) {
  if (!posts.length) return <div className={styles.calendarEmpty}>Nenhuma publicação neste cronograma.</div>
  return <div className={styles.postList}>{posts.map(post => {
    const cover = post.media_assets?.[0]
    return <Link className={styles.postRow} href={`/admin/clientes/${clientId}/posts/${post.id}`} key={post.id}>
      {cover?.url ? (cover.mime_type.startsWith('video/') ? <span className={styles.postThumb}>VÍDEO</span> :
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.postThumb} src={cover.url} alt="" />) : <span className={styles.postThumb}>SEM<br />MÍDIA</span>}
      <div className={styles.postInfo}><strong>{post.title}</strong><span>{post.format === 'carousel' ? `${post.media_assets?.length ?? 0} peças · ${post.aspect_ratio ?? '1:1'}` : `Publicação ${post.aspect_ratio ?? '1:1'}`}</span></div>
      <span className={styles.postDate}>{formatDate(post.scheduled_at)}</span><span className={`${styles.statusBadge} ${statusClass(post.status)}`}>{POST_STATUS_LABELS[post.status]}</span><span className={styles.arrow}>›</span>
    </Link>
  })}</div>
}

export default function ClientWorkspace({ clientId }: { clientId: string }) {
  const [client, setClient] = useState<ContentClient | null>(null)
  const [portal, setPortal] = useState<PortalInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [calendarModal, setCalendarModal] = useState(false)
  const [calendarSaving, setCalendarSaving] = useState(false)
  const [calendarForm, setCalendarForm] = useState({ name: '', starts_on: '', ends_on: '', status: 'draft' })
  const [releasing, setReleasing] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const loadWorkspace = useCallback(async () => {
    setLoading(true)
    try {
      const [clientResponse, portalResponse] = await Promise.all([
        fetch(`/api/admin/content/clients/${clientId}`),
        fetch(`/api/admin/content/clients/${clientId}/portal-info`),
      ])
      const [clientData, portalData] = await Promise.all([clientResponse.json(), portalResponse.json()])
      if (!clientResponse.ok) throw new Error(clientData.error || 'Não foi possível abrir a pasta.')
      if (!portalResponse.ok) throw new Error(portalData.error || 'Não foi possível abrir o portal.')
      setClient(clientData.client)
      setPortal(portalData)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao carregar cliente.') }
    finally { setLoading(false) }
  }, [clientId])

  useEffect(() => { loadWorkspace() }, [loadWorkspace])

  const stats = useMemo(() => {
    const posts = [...(client?.posts ?? []), ...(client?.content_calendars ?? []).flatMap(calendar => calendar.posts)]
    return { total: posts.length, pending: posts.filter(post => post.status === 'pending_review').length, changes: posts.filter(post => post.status === 'changes_requested').length, approved: posts.filter(post => post.status === 'approved').length }
  }, [client])

  async function copyPortal() {
    if (!portal) return
    await navigator.clipboard.writeText(portal.portal_url)
    setCopied(true)
    setNotice('Link permanente copiado. Ele não muda entre os envios.')
  }

  async function releaseCalendar(calendar: ContentCalendar) {
    setReleasing(calendar.id)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/admin/content/clients/${clientId}/portal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ calendar_id: calendar.id }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível liberar o cronograma.')
      await navigator.clipboard.writeText(data.portal_url)
      setNotice(data.reused ? 'Este cronograma já estava liberado. O link permanente foi copiado.' : 'Cronograma liberado com os posts atuais. O link permanente foi copiado.')
      setCopied(true)
      await loadWorkspace()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível liberar o cronograma.') }
    finally { setReleasing(null) }
  }

  async function createCalendar(event: FormEvent) {
    event.preventDefault()
    setCalendarSaving(true)
    try {
      const response = await fetch(`/api/admin/content/clients/${clientId}/calendars`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...calendarForm, starts_on: calendarForm.starts_on || null, ends_on: calendarForm.ends_on || null }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível criar o cronograma.')
      setClient(previous => previous ? { ...previous, content_calendars: [data.calendar, ...(previous.content_calendars ?? [])] } : previous)
      setCalendarForm({ name: '', starts_on: '', ends_on: '', status: 'draft' })
      setCalendarModal(false)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível criar o cronograma.') }
    finally { setCalendarSaving(false) }
  }

  if (loading) return <div className={styles.loading}><span className={styles.spin} /><br />Abrindo a pasta do cliente…</div>
  if (!client || !portal) return <div className={styles.errorBox}>{error || 'Cliente não encontrado.'}</div>

  return <div className={styles.hub}>
    <Link className={styles.backLink} href="/admin/clientes">← Todas as pastas</Link>
    <div className={styles.pageHeader}>
      <div className={styles.clientHero}>{client.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.avatar} src={client.avatar_url} alt="" />) : <span className={styles.avatarFallback}>{initials(client.name)}</span>}<div><div className={styles.eyebrow}>Pasta do cliente</div><h1 className={styles.pageTitle}>{client.name}</h1><div className={styles.clientMeta}>{client.instagram && <span>@{client.instagram}</span>}<span>{client.email}</span>{client.contact_name && <span>Contato: {client.contact_name}</span>}</div></div></div>
      <div className={styles.toolbar} style={{ marginBottom: 0 }}><Link className={styles.secondaryButton} href={`/admin/clientes/${clientId}/editar`}>Editar cliente</Link><button className={styles.primaryButton} type="button" onClick={() => setCalendarModal(true)}>＋ Novo cronograma</button></div>
    </div>
    {error && <div className={styles.errorBox}>{error}</div>}{notice && <div className={styles.successBox}>{notice}</div>}

    <section className={styles.surface} style={{ marginBottom: 22 }}>
      <div className={styles.surfaceHeader}><div><div className={styles.eyebrow} style={{ color: '#2878ff' }}>Portal permanente</div><strong style={{ color: '#13273f', fontSize: 17 }}>/{portal.portal_slug}</strong></div><button className={styles.primaryButton} type="button" onClick={copyPortal}>{copied ? 'Copiado ✓' : 'Copiar link do cliente'}</button></div>
      <div className={styles.surfaceBody} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(220px, .6fr)', gap: 18 }}>
        <div><p style={{ color: '#607188', fontSize: 13, lineHeight: 1.65, margin: 0 }}>Este endereço não expira e não precisa ser gerado novamente. Cada cronograma liberado mantém a lista de posts fixa dentro do portal.</p><div style={{ background: '#eaf2ff', border: '1px solid #cddfff', borderRadius: 11, color: '#245da9', fontSize: 12, marginTop: 13, padding: 12, wordBreak: 'break-all' }}>{portal.portal_url}</div></div>
        <div style={{ background: '#fff', border: '1px solid #dfe5ed', borderRadius: 12, padding: 13 }}><span style={{ color: '#7b8a9c', display: 'block', fontSize: 9, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>E-mail autorizado</span><strong style={{ color: '#263a52', display: 'block', fontSize: 12, marginTop: 7, wordBreak: 'break-all' }}>{portal.approvers.find(item => item.active)?.email ?? client.email}</strong><span style={{ color: '#8b98a8', display: 'block', fontSize: 10, marginTop: 5 }}>Apenas este e-mail libera a entrada.</span></div>
      </div>
    </section>

    <div className={styles.summaryRail}><div className={styles.summaryCard}><strong>{stats.total}</strong><span>Publicações</span></div><div className={styles.summaryCard}><strong>{stats.pending}</strong><span>Aguardando</span></div><div className={styles.summaryCard}><strong>{stats.changes}</strong><span>Correções</span></div><div className={styles.summaryCard}><strong>{stats.approved}</strong><span>Aprovadas</span></div></div>
    <div className={styles.toolbar} style={{ justifyContent: 'space-between' }}><div><div className={styles.eyebrow}>Linha de produção</div><strong style={{ color: '#dceafb', fontSize: 15 }}>Cronogramas de conteúdo</strong></div></div>

    <div className={styles.calendarStack}>{(client.content_calendars ?? []).map(calendar => {
      const batch = portal.batches.find(item => item.calendar_id === calendar.id && item.status === 'open')
      return <section className={styles.calendar} key={calendar.id}><header className={styles.calendarHeader}><div><h2 className={styles.calendarTitle}>{calendar.name}</h2><div className={styles.calendarDates}>{formatDate(calendar.starts_on)} {calendar.ends_on ? `— ${formatDate(calendar.ends_on)}` : ''} · {CALENDAR_STATUS_LABELS[calendar.status]}{batch ? ' · Portal liberado' : ''}</div></div><div className={styles.calendarActions}>{batch ? <button className={styles.quietButton} type="button" onClick={copyPortal}>✓ Copiar portal</button> : <button className={styles.quietButton} disabled={releasing === calendar.id || !calendar.posts.length} type="button" onClick={() => releaseCalendar(calendar)}>{releasing === calendar.id ? 'Liberando…' : 'Liberar posts no portal'}</button>}<Link className={styles.primaryButton} href={`/admin/clientes/${clientId}/posts/novo?calendar=${calendar.id}`}>＋ Publicação</Link></div></header><PostRows posts={calendar.posts} clientId={clientId} /></section>
    })}
      {Boolean(client.posts?.length) && <section className={styles.calendar}><header className={styles.calendarHeader}><div><h2 className={styles.calendarTitle}>Publicações avulsas</h2><div className={styles.calendarDates}>Conteúdos ainda sem cronograma</div></div><Link className={styles.primaryButton} href={`/admin/clientes/${clientId}/posts/novo`}>＋ Publicação</Link></header><PostRows posts={client.posts ?? []} clientId={clientId} /></section>}
      {!(client.content_calendars?.length) && !(client.posts?.length) && <div className={styles.emptyState}><strong>Esta pasta ainda está vazia</strong><span>Crie um cronograma para organizar a primeira sequência de posts.</span><button className={styles.primaryButton} type="button" onClick={() => setCalendarModal(true)}>Criar cronograma</button></div>}
    </div>

    {calendarModal && <div className={styles.modalBackdrop} role="presentation" onMouseDown={event => event.target === event.currentTarget && setCalendarModal(false)}><form className={styles.modal} onSubmit={createCalendar}><h2 className={styles.modalTitle}>Novo cronograma</h2><div className={styles.formGrid}><div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="calendar-name">Nome</label><input id="calendar-name" required value={calendarForm.name} onChange={event => setCalendarForm(previous => ({ ...previous, name: event.target.value }))} placeholder="Ex.: Conteúdo de agosto" /></div><div className={styles.field}><label htmlFor="calendar-start">Início</label><input id="calendar-start" type="date" value={calendarForm.starts_on} onChange={event => setCalendarForm(previous => ({ ...previous, starts_on: event.target.value }))} /></div><div className={styles.field}><label htmlFor="calendar-end">Fim</label><input id="calendar-end" type="date" value={calendarForm.ends_on} onChange={event => setCalendarForm(previous => ({ ...previous, ends_on: event.target.value }))} /></div><div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="calendar-status">Etapa</label><select id="calendar-status" value={calendarForm.status} onChange={event => setCalendarForm(previous => ({ ...previous, status: event.target.value }))}><option value="draft">Em montagem</option><option value="active">Em aprovação</option></select></div></div><div className={styles.formActions}><button className={styles.quietButton} type="button" onClick={() => setCalendarModal(false)}>Cancelar</button><button className={styles.primaryButton} disabled={calendarSaving} type="submit">{calendarSaving ? 'Criando…' : 'Criar cronograma'}</button></div></form></div>}
  </div>
}
