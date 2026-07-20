'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import PostPreview from './PostPreview'
import hubStyles from './ContentHub.module.css'
import styles from './ClientPortal.module.css'

type ReviewDecision = 'approved' | 'changes_requested'
type PortalPostStatus = 'draft' | 'pending_review' | 'changes_requested' | 'in_progress' | 'approved' | 'published' | 'archived'

interface PortalMedia {
  id: string
  url?: string
  mime_type: string
  crop_x?: number
  crop_y?: number
  zoom?: number
}

interface PortalReview {
  decision: ReviewDecision
  comment: string | null
  reviewer_name: string | null
  created_at: string
}

interface PortalPost {
  id: string
  title: string
  scheduled_at: string | null
  format: string
  aspect_ratio: '1:1' | '4:5'
  caption: string
  hashtags: string
  status: PortalPostStatus
  current_version: number
  version_at_publish: number
  media: PortalMedia[]
  latest_review: PortalReview | null
}

interface PortalBatch {
  id: string
  title: string
  slug: string
  status: 'draft' | 'open' | 'closed' | 'archived'
  published_at: string | null
  posts: PortalPost[]
}

interface PortalFeed {
  client: {
    id: string
    name: string
    contact_name: string | null
    instagram: string | null
    avatar_url: string | null
  }
  batches: PortalBatch[]
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

function formatDate(value: string | null) {
  if (!value) return 'Data a definir'
  return new Date(value).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' })
}

function dotClass(status: PortalPostStatus) {
  if (status === 'approved' || status === 'published') return hubStyles.dotApproved
  if (status === 'changes_requested' || status === 'in_progress') return hubStyles.dotChanges
  return hubStyles.dotPending
}

function isReviewed(post: PortalPost) {
  return post.status === 'approved' || post.status === 'published' || post.status === 'changes_requested' || post.status === 'in_progress'
}

export default function ClientPortal({ slug }: { slug: string }) {
  const [feed, setFeed] = useState<PortalFeed | null>(null)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [batchIndex, setBatchIndex] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctionOpen, setCorrectionOpen] = useState(false)
  const [comment, setComment] = useState('')

  const loadPortal = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/portal/${encodeURIComponent(slug)}`, { cache: 'no-store' })
      const data = await response.json()
      if (response.status === 401) {
        setAuthenticated(false)
        setFeed(null)
        return
      }
      if (!response.ok) throw new Error(data.error || 'Não foi possível abrir o portal agora.')
      setFeed(data)
      setAuthenticated(true)
      const firstOpen = data.batches.findIndex((batch: PortalBatch) => batch.status === 'open')
      const nextBatchIndex = firstOpen >= 0 ? firstOpen : 0
      setBatchIndex(nextBatchIndex)
      const firstPending = data.batches[nextBatchIndex]?.posts.findIndex((post: PortalPost) => !isReviewed(post)) ?? -1
      setCurrentIndex(firstPending >= 0 ? firstPending : 0)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível abrir o portal agora.')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { loadPortal() }, [loadPortal])

  const batch = feed?.batches[batchIndex]
  const current = batch?.posts[currentIndex]
  const reviewedCount = useMemo(() => batch?.posts.filter(isReviewed).length ?? 0, [batch])

  async function login(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch(`/api/portal/${encodeURIComponent(slug)}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível liberar o acesso.')
      await loadPortal()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível liberar o acesso.')
    } finally {
      setSubmitting(false)
    }
  }

  async function logout() {
    await fetch(`/api/portal/${encodeURIComponent(slug)}/logout`, { method: 'POST' })
    setFeed(null)
    setEmail('')
    setAuthenticated(false)
    setNotice('')
    setError('')
  }

  function selectBatch(index: number) {
    setBatchIndex(index)
    const firstPending = feed?.batches[index]?.posts.findIndex(post => !isReviewed(post)) ?? -1
    setCurrentIndex(firstPending >= 0 ? firstPending : 0)
    setCorrectionOpen(false)
    setComment('')
    setNotice('')
  }

  function selectPost(index: number) {
    setCurrentIndex(index)
    setCorrectionOpen(false)
    setComment('')
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function nextPost() {
    if (!batch) return
    const nextPending = batch.posts.findIndex((post, index) => index > currentIndex && !isReviewed(post))
    if (nextPending >= 0) selectPost(nextPending)
    else if (currentIndex < batch.posts.length - 1) selectPost(currentIndex + 1)
  }

  async function submitDecision(decision: ReviewDecision) {
    if (!batch || !current || (decision === 'changes_requested' && !comment.trim())) return
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/portal/${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: batch.id, post_id: current.id, decision, comment: decision === 'changes_requested' ? comment.trim() : null }),
      })
      const data = await response.json()
      if (response.status === 401) {
        setAuthenticated(false)
        setFeed(null)
        throw new Error('Sua sessão expirou. Informe seu e-mail novamente.')
      }
      if (!response.ok) throw new Error(data.error || 'Não foi possível registrar sua resposta.')

      setFeed(previous => previous ? {
        ...previous,
        batches: previous.batches.map(item => item.id !== batch.id ? item : {
          ...item,
          posts: item.posts.map(post => post.id !== current.id ? post : {
            ...post,
            status: data.status,
            latest_review: {
              decision,
              comment: decision === 'changes_requested' ? comment.trim() : null,
              reviewer_name: null,
              created_at: new Date().toISOString(),
            },
          }),
        }),
      } : previous)
      setCorrectionOpen(false)
      setComment('')
      setNotice(decision === 'approved' ? 'Publicação aprovada com sucesso.' : 'Pedido de correção enviado à Major Hub.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível registrar sua resposta.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || authenticated === null) {
    return <main className={styles.accessPage}><div className={styles.loadingCard}><span className={hubStyles.spin} /><p>Preparando seu portal…</p></div></main>
  }

  if (!authenticated) {
    return <main className={styles.accessPage}>
      <section className={styles.accessShell}>
        <div className={styles.accessStory}>
          <div className={styles.brand}><span className={styles.brandMark}>MH</span><span>Major Hub</span></div>
          <div className={styles.storyContent}>
            <span className={styles.kicker}>Portal de aprovação</span>
            <h1>Suas publicações,<br />em um só lugar.</h1>
            <p>Veja as artes no formato do Instagram, navegue pelos carrosséis e aprove ou solicite ajustes com poucos cliques.</p>
            <div className={styles.portalAddress}>majorhub.com.br/<strong>{slug}</strong></div>
          </div>
          <span className={styles.storyFoot}>Conteúdo protegido · acesso exclusivo do cliente</span>
        </div>
        <div className={styles.accessFormArea}>
          <form className={styles.accessForm} onSubmit={login}>
            <span className={styles.mobileBrand}><span className={styles.brandMark}>MH</span> Major Hub</span>
            <div className={styles.formNumber}>01</div>
            <h2>Acessar aprovação</h2>
            <p>Digite o e-mail cadastrado pela Major Hub. Não enviaremos código ou senha.</p>
            {error && <div className={styles.formError} role="alert">{error}</div>}
            <label htmlFor="portal-email">E-mail autorizado</label>
            <input id="portal-email" autoComplete="email" inputMode="email" required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="voce@empresa.com.br" />
            <button disabled={submitting} type="submit">{submitting ? 'Verificando…' : 'Entrar no portal'} <span aria-hidden="true">→</span></button>
            <small>O acesso fica salvo neste dispositivo por 7 dias.</small>
          </form>
        </div>
      </section>
    </main>
  }

  if (!feed || !batch || !current) {
    return <main className={`${hubStyles.hub} ${hubStyles.approvalPage}`}>
      <header className={hubStyles.approvalHeader}><div className={hubStyles.approvalBrand}><span className={hubStyles.approvalBrandMark}>MH</span><div><strong>Major Hub</strong><span>Portal de aprovação</span></div></div><button className={styles.logoutButton} type="button" onClick={logout}>Sair</button></header>
      <div className={hubStyles.approvalEmpty}><div className={hubStyles.approvalBrandMark}>✓</div><h1>Tudo em dia por aqui</h1><p>A Major Hub ainda não liberou um cronograma para aprovação neste portal.</p></div>
    </main>
  }

  const handle = feed.client.instagram?.replace(/^@/, '') || slug
  const batchOpen = batch.status === 'open'

  return <main className={`${hubStyles.hub} ${hubStyles.approvalPage}`}>
    <header className={hubStyles.approvalHeader}>
      <div className={hubStyles.approvalBrand}><span className={hubStyles.approvalBrandMark}>MH</span><div><strong>Major Hub</strong><span>Portal de aprovação</span></div></div>
      <div className={styles.headerRight}>
        <div className={hubStyles.approvalClient}><div><strong>{feed.client.name}</strong><span>@{handle}</span></div>{feed.client.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={hubStyles.avatar} src={feed.client.avatar_url} alt="" />
        ) : <span className={hubStyles.avatarFallback}>{initials(feed.client.name)}</span>}</div>
        <button className={styles.logoutButton} type="button" onClick={logout}>Sair</button>
      </div>
    </header>

    {feed.batches.length > 1 && <nav className={styles.batchNav} aria-label="Envios disponíveis">{feed.batches.map((item, index) => <button className={index === batchIndex ? styles.batchActive : ''} key={item.id} onClick={() => selectBatch(index)} type="button"><span>{item.status === 'open' ? 'Em aprovação' : 'Histórico'}</span>{item.title}</button>)}</nav>}

    <div className={hubStyles.approvalProgress}>
      <div className={hubStyles.progressTop}><strong>{reviewedCount} de {batch.posts.length} analisadas</strong><span>{batchOpen ? 'Seu progresso fica salvo automaticamente' : 'Este envio está encerrado'}</span></div>
      <div className={hubStyles.progressTrack}><div className={hubStyles.progressFill} style={{ width: `${batch.posts.length ? reviewedCount / batch.posts.length * 100 : 0}%` }} /></div>
    </div>


    <section className={styles.mobileDecisionBar} aria-label="Aprovação da publicação atual">
      <div className={styles.mobilePostNav}>
        <button aria-label="Publicação anterior" disabled={currentIndex === 0} type="button" onClick={() => selectPost(currentIndex - 1)}>‹</button>
        <div className={styles.mobilePostIdentity}>
          <span>Publicação {String(currentIndex + 1).padStart(2, '0')} de {String(batch.posts.length).padStart(2, '0')}</span>
          <strong>{current.title}</strong>
          <small>{formatDate(current.scheduled_at)}</small>
        </div>
        <button aria-label="Próxima publicação" disabled={currentIndex === batch.posts.length - 1} type="button" onClick={() => selectPost(currentIndex + 1)}>›</button>
      </div>

      {notice && <div className={styles.mobileNotice}>{notice}</div>}
      {error && <div className={styles.mobileError}>{error}</div>}

      {!batchOpen ? <div className={styles.mobileResolved}>Envio encerrado · disponível para consulta</div> : current.status === 'approved' || current.status === 'published' ? <div className={[styles.mobileResolved, styles.mobileApproved].join(' ')}>✓ Publicação aprovada</div> : current.status === 'changes_requested' || current.status === 'in_progress' ? <div className={[styles.mobileResolved, styles.mobileChanges].join(' ')}>Correção solicitada à equipe</div> : <>
        <div className={styles.mobileDecisionActions}>
          <button className={styles.mobileApprove} disabled={submitting} type="button" onClick={() => submitDecision('approved')}>✓ Aprovar</button>
          <button className={styles.mobileCorrect} disabled={submitting} type="button" onClick={() => setCorrectionOpen(previous => !previous)}>Corrigir</button>
        </div>
        {correctionOpen && <div className={styles.mobileCorrection}>
          <label htmlFor="mobile-correction">O que precisa mudar?</label>
          <textarea id="mobile-correction" autoFocus value={comment} onChange={event => setComment(event.target.value)} placeholder="Indique a imagem, legenda ou informação que precisa de ajuste." />
          <div><button type="button" onClick={() => setCorrectionOpen(false)}>Cancelar</button><button disabled={submitting || !comment.trim()} type="button" onClick={() => submitDecision('changes_requested')}>{submitting ? 'Enviando…' : 'Enviar correção'}</button></div>
        </div>}
      </>}
    </section>

    <div className={`${hubStyles.approvalLayout} ${styles.mobilePreviewLayout}`}>
      <aside className={`${hubStyles.sequencePanel} ${styles.desktopSequence}`}>
        <div className={hubStyles.sequenceTitle}>{batch.title}</div>
        <div className={hubStyles.sequenceList}>{batch.posts.map((post, index) => <button className={`${hubStyles.sequenceItem} ${index === currentIndex ? hubStyles.sequenceItemActive : ''}`} key={post.id} type="button" onClick={() => selectPost(index)}><span className={hubStyles.sequenceNumber}>{String(index + 1).padStart(2, '0')}</span><span className={hubStyles.sequenceInfo}><strong>{post.title}</strong><span>{formatDate(post.scheduled_at)}</span></span><span className={`${hubStyles.statusDot} ${dotClass(post.status)}`} /></button>)}</div>
      </aside>

      <section className={hubStyles.previewColumn}>
        <div className={hubStyles.proofLabel}><strong>Publicação {String(currentIndex + 1).padStart(2, '0')}</strong><span>Arraste para ver o carrossel</span></div>
        <PostPreview post={current} client={feed.client} />
      </section>

      <aside className={`${hubStyles.reviewPanel} ${styles.desktopReview}`}>
        <div className={hubStyles.reviewIndex}>{String(currentIndex + 1).padStart(2, '0')} <span>/ {String(batch.posts.length).padStart(2, '0')}</span></div>
        <h1 className={hubStyles.reviewTitle}>{current.title}</h1>
        <div className={hubStyles.reviewDate}>{formatDate(current.scheduled_at)} · versão {current.current_version}</div>
        <hr className={hubStyles.reviewDivider} />

        {notice && <div className={hubStyles.successBox}>{notice}</div>}
        {error && <div className={hubStyles.errorBox}>{error}</div>}

        {!batchOpen ? <div className={`${hubStyles.resolvedBox} ${hubStyles.resolvedApproved}`}><strong>Envio encerrado</strong><br />Este cronograma está disponível apenas para consulta.</div> : current.status === 'approved' || current.status === 'published' ? <div className={`${hubStyles.resolvedBox} ${hubStyles.resolvedApproved}`}><strong>✓ Publicação aprovada</strong><br />Sua aprovação já foi registrada.</div> : current.status === 'changes_requested' || current.status === 'in_progress' ? <div className={`${hubStyles.resolvedBox} ${hubStyles.resolvedChanges}`}><strong>Correção solicitada</strong><br />A equipe da Major Hub recebeu seu pedido.{current.latest_review?.comment && <span className={hubStyles.feedbackQuote}>{current.latest_review.comment}</span>}</div> : <>
          <p className={hubStyles.reviewPrompt}>Confira a arte, navegue pelo carrossel e leia a legenda. Depois, registre sua decisão.</p>
          <div className={hubStyles.reviewActions}><button className={hubStyles.approveButton} disabled={submitting} type="button" onClick={() => submitDecision('approved')}>✓ Aprovar publicação</button><button className={hubStyles.correctionButton} disabled={submitting} type="button" onClick={() => setCorrectionOpen(true)}>Pedir uma correção</button></div>
          {correctionOpen && <div className={hubStyles.correctionBox}><label htmlFor="correction">O que precisa ser corrigido?</label><textarea id="correction" autoFocus value={comment} onChange={event => setComment(event.target.value)} placeholder="Indique a imagem, o trecho da legenda ou a informação que deve mudar." /><div className={hubStyles.correctionActions}><button className={hubStyles.quietButton} type="button" onClick={() => setCorrectionOpen(false)}>Cancelar</button><button className={hubStyles.correctionButton} disabled={submitting || !comment.trim()} type="button" onClick={() => submitDecision('changes_requested')}>{submitting ? 'Enviando…' : 'Enviar correção'}</button></div></div>}
        </>}

        {currentIndex < batch.posts.length - 1 && <button className={hubStyles.nextButton} type="button" onClick={nextPost}>Próxima publicação →</button>}
      </aside>
    </div>
  </main>
}


