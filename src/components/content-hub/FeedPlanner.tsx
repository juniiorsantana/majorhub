'use client'

import { DragEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import FeedThumb from './FeedThumb'
import styles from './ContentStudio.module.css'
import { canMoveInFeed, profileOrder } from '@/lib/content-hub/feed-planner'
import type { ContentCalendar, ContentPost, PostStatus } from '@/lib/content-hub/types'

export interface ScheduleChange { id: string; scheduled_at: string | null }

interface FeedPlannerProps {
  clientId: string
  posts: ContentPost[]
  calendars: ContentCalendar[]
  onScheduleChange: (changes: ScheduleChange[]) => void
}

const SHORT_STATUS: Record<PostStatus, string> = {
  draft: 'Rascunho',
  pending_review: 'Aguardando',
  changes_requested: 'Correção',
  in_progress: 'Em correção',
  approved: 'Aprovada',
  published: 'Publicada',
  archived: 'Arquivada',
}

const FORMAT_LABELS: Record<ContentPost['format'], string> = { image: 'Imagem', carousel: 'Carrossel', video: 'Vídeo', reel: 'Reels' }

function statusClass(status: PostStatus) {
  return styles[`status_${status}`] ?? ''
}

function shortDay(value: string) {
  const date = new Date(value)
  return `${date.getDate()} ${date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}`
}

function postLabel(post: ContentPost) {
  return post.creative_code || post.title
}

export default function FeedPlanner({ clientId, posts, calendars, onScheduleChange }: FeedPlannerProps) {
  const [calendarFilter, setCalendarFilter] = useState('all')
  const [organizing, setOrganizing] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [swapping, setSwapping] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ text: string; pair: [string, string] } | null>(null)

  const filtered = useMemo(() => calendarFilter === 'all' ? posts : posts.filter(post => (post.calendar_id ?? 'avulsas') === calendarFilter), [calendarFilter, posts])
  const { grid, undated } = useMemo(() => profileOrder(filtered), [filtered])
  const agenda = useMemo(() => [...grid].reverse().filter(post => post.status !== 'published'), [grid])
  const byId = useMemo(() => new Map(posts.map(post => [post.id, post])), [posts])
  const sourceId = dragId ?? selectedId
  const source = sourceId ? byId.get(sourceId) : undefined

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 9000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const agendaSummary = useMemo(() => {
    const counts = new Map<PostStatus, number>()
    agenda.forEach(post => counts.set(post.status, (counts.get(post.status) ?? 0) + 1))
    return [...counts.entries()].map(([status, count]) => `${count} ${SHORT_STATUS[status].toLowerCase()}`).join(' · ')
  }, [agenda])

  function toggleOrganizing() {
    setOrganizing(current => !current)
    setSelectedId(null)
    setHoverId(null)
    setError('')
  }

  async function swap(firstId: string, secondId: string, undoing = false) {
    const first = byId.get(firstId)
    const second = byId.get(secondId)
    if (!first || !second || swapping) return
    setSelectedId(null)
    setDragId(null)
    setHoverId(null)
    setError('')
    setSwapping(true)
    // Troca na tela na hora; se o servidor recusar, volta como estava.
    onScheduleChange([{ id: firstId, scheduled_at: second.scheduled_at }, { id: secondId, scheduled_at: first.scheduled_at }])
    try {
      const response = await fetch(`/api/admin/content/clients/${clientId}/feed/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_post_id: firstId, second_post_id: secondId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível trocar as datas.')
      setToast(undoing ? null : { text: `${postLabel(first)} e ${postLabel(second)} trocaram de data`, pair: [firstId, secondId] })
    } catch (cause) {
      onScheduleChange([{ id: firstId, scheduled_at: first.scheduled_at }, { id: secondId, scheduled_at: second.scheduled_at }])
      setError(cause instanceof Error ? cause.message : 'Não foi possível trocar as datas.')
    } finally {
      setSwapping(false)
    }
  }

  function pick(post: ContentPost) {
    if (!canMoveInFeed(post)) return
    if (!selectedId) setSelectedId(post.id)
    else if (selectedId === post.id) setSelectedId(null)
    else swap(selectedId, post.id)
  }

  function onDragStart(event: DragEvent<HTMLButtonElement>, post: ContentPost) {
    event.dataTransfer.setData('text/plain', post.id)
    event.dataTransfer.effectAllowed = 'move'
    setDragId(post.id)
  }

  function onDragOver(event: DragEvent<HTMLButtonElement>, post: ContentPost) {
    if (!dragId || dragId === post.id || !canMoveInFeed(post)) return
    event.preventDefault()
    if (hoverId !== post.id) setHoverId(post.id)
  }

  function onDrop(event: DragEvent<HTMLButtonElement>, post: ContentPost) {
    event.preventDefault()
    if (dragId && dragId !== post.id && canMoveInFeed(post)) swap(dragId, post.id)
    else { setDragId(null); setHoverId(null) }
  }

  const calendarOptions = [
    ...calendars.map(calendar => ({ value: calendar.id, label: calendar.name })),
    ...(posts.some(post => !post.calendar_id) ? [{ value: 'avulsas', label: 'Publicações avulsas' }] : []),
  ]

  return <div className={styles.plannerLayout}>
    <section className={styles.panel} aria-labelledby="feed-title">
      <header className={styles.panelHeader}>
        <div>
          <h2 id="feed-title" className={styles.panelTitle}>Feed do perfil</h2>
          <span className={styles.panelSubtitle}>A mais recente primeiro, como no Instagram</span>
        </div>
        <div className={styles.panelActions}>
          <label className={styles.visuallyHidden} htmlFor="feed-calendar">Cronograma</label>
          <select id="feed-calendar" className={styles.compactSelect} value={calendarFilter} onChange={event => setCalendarFilter(event.target.value)}>
            <option value="all">Todos os cronogramas</option>
            {calendarOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <button type="button" className={organizing ? styles.organizeActive : styles.organizeButton} aria-pressed={organizing} onClick={toggleOrganizing} disabled={!grid.length}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 4v16M7 4 3 8M7 4l4 4" /><path d="M17 20V4M17 20l-4-4M17 20l4-4" /></svg>
            {organizing ? 'Concluir' : 'Organizar'}
          </button>
        </div>
      </header>

      {organizing && <p className={styles.organizeHint}>Arraste uma peça sobre outra, ou clique em duas, para trocar as datas. Publicadas ficam travadas.</p>}
      {error && <p role="alert" className={styles.inlineError}>{error}</p>}

      {grid.length ? <ul className={styles.plannerGrid} aria-label="Grade do perfil">
        {grid.map(post => {
          const locked = !canMoveInFeed(post)
          const selected = organizing && sourceId === post.id
          const target = organizing && Boolean(source) && hoverId === post.id && sourceId !== post.id && !locked
          const label = `${postLabel(post)}, ${post.title}, ${shortDay(post.scheduled_at!)}, ${SHORT_STATUS[post.status]}${organizing && locked ? ', travada' : ''}`
          const content = <>
            <FeedThumb media={post.media_assets ?? []} aspectRatio={post.aspect_ratio ?? '1:1'} />
            <span className={`${styles.tileStatus} ${statusClass(post.status)}`}>{SHORT_STATUS[post.status]}</span>
            {(post.media_assets?.length ?? 0) > 1 && <svg className={styles.tileFormat} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="7" width="13" height="13" rx="2" /><path d="M4 16V6a2 2 0 0 1 2-2h10" /></svg>}
            {(post.media_assets?.length ?? 0) <= 1 && (post.format === 'reel' || post.format === 'video') && <svg className={styles.tileFormat} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="m10 8.5 5 3.5-5 3.5z" fill="currentColor" /></svg>}
            <span className={styles.tileMeta}>{post.creative_code ? `${post.creative_code} · ` : ''}{shortDay(post.scheduled_at!)}</span>
            {organizing && locked && <span className={styles.tileLock} aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg></span>}
            {selected && <span className={styles.tileSelected}><span>Movendo {postLabel(post)}</span></span>}
            {target && source && <span className={styles.tileTarget}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 4v16M7 4 3 8M7 4l4 4" /><path d="M17 20V4M17 20l-4-4M17 20l4-4" /></svg>
              <strong>Trocar datas</strong>
              <span>{shortDay(source.scheduled_at!)} ⇄ {shortDay(post.scheduled_at!)}</span>
            </span>}
          </>
          return <li key={post.id}>
            {organizing
              ? <button
                  type="button"
                  className={`${styles.tile} ${locked ? styles.tileLocked : styles.tileMovable} ${selected ? styles.tileLifted : ''}`}
                  draggable={!locked}
                  aria-pressed={selected}
                  aria-label={label}
                  disabled={swapping}
                  onClick={() => pick(post)}
                  onDragStart={event => onDragStart(event, post)}
                  onDragOver={event => onDragOver(event, post)}
                  onDragLeave={() => hoverId === post.id && setHoverId(null)}
                  onDrop={event => onDrop(event, post)}
                  onDragEnd={() => { setDragId(null); setHoverId(null) }}
                >{content}</button>
              : <Link className={styles.tile} href={`/admin/clientes/${clientId}/posts/${post.id}`} aria-label={label}>{content}</Link>}
          </li>
        })}
      </ul> : <div className={styles.panelEmpty}><strong>Nenhuma publicação com data</strong><span>Defina a data das peças para ver como o feed fica.</span></div>}
    </section>

    <div className={styles.sideColumn}>
      <section className={styles.panel} aria-labelledby="agenda-title">
        <header className={styles.panelHeader}>
          <div>
            <h2 id="agenda-title" className={styles.panelTitle}>Próximas publicações</h2>
            <span className={styles.panelSubtitle}>{agenda.length ? `${agenda.length} ${agenda.length === 1 ? 'publicação' : 'publicações'} · ${agendaSummary}` : 'Nada agendado para os próximos dias'}</span>
          </div>
        </header>
        {agenda.length > 0 && <ol className={styles.agenda}>
          {agenda.map(post => {
            const date = new Date(post.scheduled_at!)
            return <li key={post.id}>
              <Link className={`${styles.agendaRow} ${organizing && sourceId === post.id ? styles.agendaRowActive : ''}`} href={`/admin/clientes/${clientId}/posts/${post.id}`}>
                <span className={styles.agendaDay}><strong>{date.getDate()}</strong><span>{date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span></span>
                <span className={styles.agendaThumb}><FeedThumb media={post.media_assets ?? []} aspectRatio={post.aspect_ratio ?? '1:1'} /></span>
                <span className={styles.agendaInfo}><strong>{post.title}</strong><span>{[post.creative_code, FORMAT_LABELS[post.format], date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })].filter(Boolean).join(' · ')}</span></span>
                <span className={`${styles.agendaStatus} ${statusClass(post.status)}`}>{SHORT_STATUS[post.status]}</span>
              </Link>
            </li>
          })}
        </ol>}
      </section>

      {undated.length > 0 && <section className={styles.panel} aria-labelledby="undated-title">
        <header className={styles.panelHeader}>
          <div>
            <h2 id="undated-title" className={styles.panelTitle}>Sem data</h2>
            <span className={styles.panelSubtitle}>Ainda fora da grade. Defina uma data para a peça entrar no feed.</span>
          </div>
        </header>
        <ul className={styles.agenda}>
          {undated.map(post => <li key={post.id} className={styles.undatedRow}>
            <span className={styles.agendaThumb}><FeedThumb media={post.media_assets ?? []} aspectRatio={post.aspect_ratio ?? '1:1'} /></span>
            <span className={styles.agendaInfo}><strong>{post.title}</strong><span>{[post.creative_code, SHORT_STATUS[post.status]].filter(Boolean).join(' · ')}</span></span>
            <Link className={styles.smallButton} href={`/admin/clientes/${clientId}/posts/${post.id}`}>Definir data</Link>
          </li>)}
        </ul>
      </section>}
    </div>

    {toast && <div role="status" className={styles.toast}>
      <span>{toast.text}</span>
      <button type="button" disabled={swapping} onClick={() => swap(toast.pair[0], toast.pair[1], true)}>Desfazer</button>
    </div>}
  </div>
}
