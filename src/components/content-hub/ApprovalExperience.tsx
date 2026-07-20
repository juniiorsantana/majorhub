'use client'

import { useEffect, useMemo, useState } from 'react'
import PostPreview from './PostPreview'
import styles from './ContentHub.module.css'

interface ApprovalMedia { id: string; url?: string; mime_type: string }
interface ApprovalPost {
  id: string
  title: string
  scheduled_at: string | null
  format: string
  caption: string
  hashtags: string
  status: 'pending_review' | 'changes_requested' | 'approved'
  current_version: number
  media: ApprovalMedia[]
  latest_review: { decision: 'approved' | 'changes_requested'; comment: string | null; reviewer_name: string | null; created_at: string } | null
}
interface ApprovalFeed {
  client: { id: string; name: string; contact_name: string | null; instagram: string | null; avatar_url: string | null }
  calendar: { id: string; name: string; starts_on: string | null; ends_on: string | null } | null
  posts: ApprovalPost[]
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

function formatDate(value: string | null) {
  if (!value) return 'Data a definir'
  return new Date(value).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' })
}

function dotClass(status: ApprovalPost['status']) {
  if (status === 'approved') return styles.dotApproved
  if (status === 'changes_requested') return styles.dotChanges
  return styles.dotPending
}

export default function ApprovalExperience({ token }: { token: string }) {
  const [feed, setFeed] = useState<ApprovalFeed | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reviewerName, setReviewerName] = useState('')
  const [correctionOpen, setCorrectionOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetch(`/api/approval/${encodeURIComponent(token)}`)
      .then(response => response.json().then(data => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || 'Este link não está disponível.')
        setFeed(data)
        const firstPending = data.posts.findIndex((post: ApprovalPost) => post.status === 'pending_review')
        setCurrentIndex(firstPending >= 0 ? firstPending : 0)
        setReviewerName(data.client.contact_name ?? '')
      })
      .catch(cause => setError(cause instanceof Error ? cause.message : 'Não foi possível abrir a aprovação.'))
      .finally(() => setLoading(false))
  }, [token])

  const current = feed?.posts[currentIndex]
  const reviewedCount = useMemo(() => feed?.posts.filter(post => post.status !== 'pending_review').length ?? 0, [feed])

  function selectPost(index: number) {
    setCurrentIndex(index)
    setCorrectionOpen(false)
    setComment('')
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function nextPost() {
    if (!feed) return
    const nextPending = feed.posts.findIndex((post, index) => index > currentIndex && post.status === 'pending_review')
    if (nextPending >= 0) selectPost(nextPending)
    else if (currentIndex < feed.posts.length - 1) selectPost(currentIndex + 1)
  }

  async function submit(decision: 'approved' | 'changes_requested') {
    if (!current || (decision === 'changes_requested' && !comment.trim())) return
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/approval/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: current.id, decision, comment: decision === 'changes_requested' ? comment : null, reviewer_name: reviewerName || null }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível registrar sua resposta.')

      setFeed(previous => previous ? {
        ...previous,
        posts: previous.posts.map(post => post.id === current.id ? {
          ...post,
          status: data.status,
          latest_review: { decision, comment: decision === 'changes_requested' ? comment : null, reviewer_name: reviewerName || null, created_at: new Date().toISOString() },
        } : post),
      } : previous)
      setCorrectionOpen(false)
      setNotice(decision === 'approved' ? 'Publicação aprovada com sucesso.' : 'Pedido de correção enviado à Major Hub.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível registrar sua resposta.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <main className={`${styles.hub} ${styles.approvalPage}`}><div className={styles.approvalEmpty}><span className={styles.spin} /><p>Preparando suas publicações…</p></div></main>
  if (error && !feed) return <main className={`${styles.hub} ${styles.approvalPage}`}><div className={styles.approvalEmpty}><div className={styles.approvalBrandMark}>MH</div><h1>Link indisponível</h1><p>{error}</p></div></main>
  if (!feed || !current) return <main className={`${styles.hub} ${styles.approvalPage}`}><div className={styles.approvalEmpty}><div className={styles.approvalBrandMark}>✓</div><h1>Tudo em dia por aqui</h1><p>A Major Hub ainda não enviou publicações para aprovação neste cronograma.</p></div></main>

  return (
    <main className={`${styles.hub} ${styles.approvalPage}`}>
      <header className={styles.approvalHeader}>
        <div className={styles.approvalBrand}><span className={styles.approvalBrandMark}>MH</span><div><strong>Major Hub</strong><span>Portal de aprovação</span></div></div>
        <div className={styles.approvalClient}>
          <div><strong>{feed.client.name}</strong><span>{feed.calendar?.name ?? 'Conteúdos em aprovação'}</span></div>
          {feed.client.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.avatar} src={feed.client.avatar_url} alt="" />
          ) : <span className={styles.avatarFallback}>{initials(feed.client.name)}</span>}
        </div>
      </header>

      <div className={styles.approvalProgress}>
        <div className={styles.progressTop}><strong>{reviewedCount} de {feed.posts.length} analisadas</strong><span>Seu progresso fica salvo automaticamente</span></div>
        <div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${feed.posts.length ? reviewedCount / feed.posts.length * 100 : 0}%` }} /></div>
      </div>

      <div className={styles.approvalLayout}>
        <aside className={styles.sequencePanel}>
          <div className={styles.sequenceTitle}>Sequência do cronograma</div>
          <div className={styles.sequenceList}>
            {feed.posts.map((post, index) => (
              <button className={`${styles.sequenceItem} ${index === currentIndex ? styles.sequenceItemActive : ''}`} key={post.id} type="button" onClick={() => selectPost(index)}>
                <span className={styles.sequenceNumber}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.sequenceInfo}><strong>{post.title}</strong><span>{formatDate(post.scheduled_at)}</span></span>
                <span className={`${styles.statusDot} ${dotClass(post.status)}`} title={post.status === 'approved' ? 'Aprovado' : post.status === 'changes_requested' ? 'Correção solicitada' : 'Aguardando'} />
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.previewColumn}>
          <div className={styles.proofLabel}><strong>Publicação {String(currentIndex + 1).padStart(2, '0')}</strong><span>Arraste para ver o carrossel</span></div>
          <PostPreview post={current} client={feed.client} />
        </section>

        <aside className={styles.reviewPanel}>
          <div className={styles.reviewIndex}>{String(currentIndex + 1).padStart(2, '0')} <span>/ {String(feed.posts.length).padStart(2, '0')}</span></div>
          <h1 className={styles.reviewTitle}>{current.title}</h1>
          <div className={styles.reviewDate}>{formatDate(current.scheduled_at)} · versão {current.current_version}</div>
          <hr className={styles.reviewDivider} />

          {notice && <div className={styles.successBox}>{notice}</div>}
          {error && <div className={styles.errorBox}>{error}</div>}

          {current.status === 'pending_review' ? (
            <>
              <p className={styles.reviewPrompt}>Confira a arte, navegue pelo carrossel e leia a legenda. Quando estiver tudo certo, registre sua decisão abaixo.</p>
              <div className={styles.reviewerField}><input value={reviewerName} onChange={event => setReviewerName(event.target.value)} placeholder="Seu nome (opcional)" aria-label="Seu nome" /></div>
              <div className={styles.reviewActions}>
                <button className={styles.approveButton} disabled={submitting} type="button" onClick={() => submit('approved')}>✓ Aprovar publicação</button>
                <button className={styles.correctionButton} disabled={submitting} type="button" onClick={() => setCorrectionOpen(true)}>Pedir uma correção</button>
              </div>
              {correctionOpen && (
                <div className={styles.correctionBox}>
                  <label htmlFor="correction">O que precisa ser corrigido?</label>
                  <textarea id="correction" autoFocus value={comment} onChange={event => setComment(event.target.value)} placeholder="Seja específico: indique a imagem, o trecho da legenda ou a informação que deve mudar." />
                  <div className={styles.correctionActions}><button className={styles.quietButton} type="button" onClick={() => setCorrectionOpen(false)}>Cancelar</button><button className={styles.correctionButton} disabled={submitting || !comment.trim()} type="button" onClick={() => submit('changes_requested')}>{submitting ? 'Enviando…' : 'Enviar correção'}</button></div>
                </div>
              )}
            </>
          ) : current.status === 'approved' ? (
            <div className={`${styles.resolvedBox} ${styles.resolvedApproved}`}><strong>✓ Publicação aprovada</strong><br />Sua aprovação já foi registrada.{current.latest_review?.reviewer_name && ` Por ${current.latest_review.reviewer_name}.`}</div>
          ) : (
            <div className={`${styles.resolvedBox} ${styles.resolvedChanges}`}><strong>Correção solicitada</strong><br />A equipe da Major Hub recebeu seu pedido.{current.latest_review?.comment && <span className={styles.feedbackQuote}>{current.latest_review.comment}</span>}</div>
          )}

          {currentIndex < feed.posts.length - 1 && <button className={styles.nextButton} type="button" onClick={nextPost}>Próxima publicação →</button>}
        </aside>
      </div>
    </main>
  )
}
