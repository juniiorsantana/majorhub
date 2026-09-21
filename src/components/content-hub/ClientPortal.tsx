'use client'

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FeedThumb from './FeedThumb'
import PortalPostDialog from './PortalPostDialog'
import hubStyles from './ContentHub.module.css'
import styles from './ClientPortal.module.css'
import feedStyles from './PortalFeed.module.css'
import { chronological, nextPendingIndex, previousFeedPosts, reviewState, type ReviewState } from '@/lib/content-hub/portal-feed'
import type { PostStatus } from '@/lib/content-hub/types'
import type { PortalBatch, PortalFeed, PortalPost, ReviewDecision } from './portal-types'

const STATUS_LABELS: Record<ReviewState, string> = {
  pending: 'a revisar',
  approved: 'aprovada',
  changes: 'ajuste pedido',
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

function shortDate(value: string | null) {
  if (!value) return 'Sem data'
  const date = new Date(value)
  return `${date.getDate()} ${date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}`
}

function isPending(post: PortalPost) {
  return reviewState(post.status) === 'pending'
}

function allReviewed(batch?: PortalBatch) {
  return Boolean(batch && batch.posts.length > 0 && !batch.posts.some(isPending))
}

function plural(count: number, singular: string, pluralForm: string) {
  return count === 1 ? singular : pluralForm
}

function FormatIcon({ post }: { post: PortalPost }) {
  if (post.media.length > 1) {
    return <svg className={feedStyles.formatIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="7" width="13" height="13" rx="2" /><path d="M4 16V6a2 2 0 0 1 2-2h10" /></svg>
  }
  if (post.format === 'reel' || post.format === 'video') {
    return <svg className={feedStyles.formatIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="m10 8.5 5 3.5-5 3.5z" fill="currentColor" /></svg>
  }
  return null
}

function StatusBadge({ state }: { state: ReviewState }) {
  if (state === 'approved') {
    return <span className={`${feedStyles.badge} ${feedStyles.badgeApproved}`}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>Aprovada</span>
  }
  if (state === 'changes') {
    return <span className={`${feedStyles.badge} ${feedStyles.badgeChanges}`}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>Ajuste</span>
  }
  return <span className={`${feedStyles.badge} ${feedStyles.badgePending}`}>Revisar</span>
}

export default function ClientPortal({ slug }: { slug: string }) {
  const [feed, setFeed] = useState<PortalFeed | null>(null)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [decisionSubmitting, setDecisionSubmitting] = useState<ReviewDecision | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [batchIndex, setBatchIndex] = useState(0)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [followerView, setFollowerView] = useState(false)
  const advanceTimer = useRef<number | undefined>(undefined)

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
      const nextFeed = data as PortalFeed
      const firstOpen = nextFeed.batches.findIndex(batch => batch.status === 'open')
      const nextBatchIndex = firstOpen >= 0 ? firstOpen : 0
      setFeed(nextFeed)
      setAuthenticated(true)
      setBatchIndex(nextBatchIndex)
      setOpenIndex(null)
      // Quem volta a um envio já todo respondido vê direto o feed como os seguidores vão ver.
      setFollowerView(allReviewed(nextFeed.batches[nextBatchIndex]))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível abrir o portal agora.')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { loadPortal() }, [loadPortal])
  useEffect(() => () => window.clearTimeout(advanceTimer.current), [])

  const batch = feed?.batches[batchIndex]
  // A navegação segue a ordem de publicação; a grade mostra o inverso, como o perfil.
  const posts = useMemo(() => chronological(batch?.posts ?? []), [batch])
  const gridPosts = useMemo(() => posts.map((post, index) => ({ post, index })).reverse(), [posts])
  const history = useMemo(() => (feed && batch ? previousFeedPosts(feed.batches, batch.id) : []), [feed, batch])
  const counts = useMemo(() => {
    const totals: Record<ReviewState, number> = { pending: 0, approved: 0, changes: 0 }
    posts.forEach(post => { totals[reviewState(post.status)] += 1 })
    return totals
  }, [posts])
  const current = openIndex === null ? undefined : posts[openIndex]

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
    window.clearTimeout(advanceTimer.current)
    setFeed(null)
    setOpenIndex(null)
    setEmail('')
    setAuthenticated(false)
    setNotice('')
    setError('')
  }

  function selectBatch(index: number) {
    window.clearTimeout(advanceTimer.current)
    setBatchIndex(index)
    setOpenIndex(null)
    setFollowerView(allReviewed(feed?.batches[index]))
    setNotice('')
    setError('')
  }

  function openPost(index: number) {
    window.clearTimeout(advanceTimer.current)
    setOpenIndex(index)
    setNotice('')
    setError('')
  }

  function closePost() {
    window.clearTimeout(advanceTimer.current)
    setOpenIndex(null)
    setNotice('')
    setError('')
  }

  function continueReview() {
    const firstPending = posts.findIndex(isPending)
    if (firstPending >= 0) openPost(firstPending)
  }

  async function submitDecision(decision: ReviewDecision, comment: string | null) {
    if (!batch || !current || openIndex === null || decisionSubmitting) return false
    setDecisionSubmitting(decision)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/portal/${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: batch.id, post_id: current.id, decision, comment }),
      })
      const data = await response.json()
      if (response.status === 401) {
        setAuthenticated(false)
        setFeed(null)
        setOpenIndex(null)
        throw new Error('Sua sessão expirou. Informe seu e-mail novamente.')
      }
      if (!response.ok) throw new Error(data.error || 'Não foi possível registrar sua resposta.')

      const status = data.status as PostStatus
      const review = { decision, comment, reviewer_name: null, created_at: new Date().toISOString() }
      setFeed(previous => previous ? {
        ...previous,
        batches: previous.batches.map(item => item.id !== batch.id ? item : {
          ...item,
          posts: item.posts.map(post => post.id !== current.id ? post : { ...post, status, latest_review: review }),
        }),
      } : previous)

      const updated = posts.map(post => post.id === current.id ? { ...post, status } : post)
      const next = nextPendingIndex(updated, openIndex, isPending)
      const approved = decision === 'approved'
      setNotice(next >= 0
        ? (approved ? 'Aprovada. Abrindo a próxima…' : 'Ajuste enviado. Abrindo a próxima…')
        : (approved ? 'Aprovada. Era a última pendente.' : 'Ajuste enviado. Era a última pendente.'))
      advanceTimer.current = window.setTimeout(() => {
        if (next >= 0) {
          openPost(next)
          return
        }
        // Tudo respondido: fecha a janela e mostra o mês como os seguidores vão ver.
        setOpenIndex(null)
        setNotice('')
        setFollowerView(true)
      }, 900)
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível registrar sua resposta.')
      return false
    } finally {
      setDecisionSubmitting(null)
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

  if (!feed || !batch || !posts.length) {
    return <main className={`${hubStyles.hub} ${hubStyles.approvalPage}`}>
      <header className={hubStyles.approvalHeader}><div className={hubStyles.approvalBrand}><span className={hubStyles.approvalBrandMark}>MH</span><div><strong>Major Hub</strong><span>Portal de aprovação</span></div></div><button className={styles.logoutButton} type="button" onClick={logout}>Sair</button></header>
      <div className={hubStyles.approvalEmpty}><div className={hubStyles.approvalBrandMark}>✓</div><h1>Tudo em dia por aqui</h1><p>A Major Hub ainda não liberou um cronograma para aprovação neste portal.</p></div>
    </main>
  }

  const handle = feed.client.instagram?.replace(/^@/, '') || slug
  const batchOpen = batch.status === 'open'
  const reviewView = !followerView
  const reviewedCount = counts.approved + counts.changes
  const hasBatchNav = feed.batches.length > 1

  return <main className={`${hubStyles.hub} ${feedStyles.page} ${hasBatchNav ? feedStyles.withBatchNav : ''}`}>
    <header className={`${hubStyles.approvalHeader} ${feedStyles.pageHeader}`}>
      <div className={hubStyles.approvalBrand}><span className={hubStyles.approvalBrandMark}>MH</span><div><strong>Major Hub</strong><span>Portal de aprovação</span></div></div>
      <div className={styles.headerRight}>
        <div className={hubStyles.approvalClient}><div><strong>{feed.client.name}</strong><span>@{handle}</span></div>{feed.client.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={hubStyles.avatar} src={feed.client.avatar_url} alt="" />
        ) : <span className={hubStyles.avatarFallback}>{initials(feed.client.name)}</span>}</div>
        <button className={styles.logoutButton} type="button" onClick={logout}>Sair</button>
      </div>
    </header>

    {hasBatchNav && <nav className={`${styles.batchNav} ${feedStyles.pageBatchNav}`} aria-label="Envios disponíveis">{feed.batches.map((item, index) => <button className={index === batchIndex ? styles.batchActive : ''} key={item.id} onClick={() => selectBatch(index)} type="button"><span>{item.status === 'open' ? 'Em aprovação' : 'Histórico'}</span>{item.title}</button>)}</nav>}

    <section className={feedStyles.profile} aria-label="Perfil">
      <div className={feedStyles.profileInner}>
        {feed.client.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={feedStyles.avatar} src={feed.client.avatar_url} alt="" />
        ) : <span className={feedStyles.avatar} aria-hidden="true">{initials(feed.client.name)}</span>}
        <h1 className={feedStyles.handle}>{handle}</h1>
        {batchOpen && counts.pending > 0 && <button type="button" className={feedStyles.continueButton} onClick={continueReview}>
          {reviewedCount ? 'Continuar revisão' : 'Começar revisão'}
        </button>}
        <ul className={feedStyles.stats}>
          <li><strong>{counts.pending}</strong> a revisar</li>
          <li><strong>{counts.approved}</strong> {plural(counts.approved, 'aprovada', 'aprovadas')}</li>
          <li><strong>{counts.changes}</strong> {plural(counts.changes, 'ajuste', 'ajustes')}</li>
        </ul>
        <div className={feedStyles.bio}>
          <strong>{feed.client.name}</strong>
          <span>{batch.title} · {posts.length} {plural(posts.length, 'publicação', 'publicações')}</span>
          <span className={feedStyles.bioHint}>{batchOpen ? 'Abra uma publicação para ver como ela fica e aprovar.' : 'Este envio está encerrado e fica disponível para consulta.'}</span>
        </div>
      </div>
    </section>

    <nav className={feedStyles.tabs} aria-label="Modo de visualização">
      <button type="button" aria-pressed={reviewView} onClick={() => setFollowerView(false)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 7 2 2 4-4" /><path d="m3 17 2 2 4-4" /><path d="M13 6h8" /><path d="M13 12h8" /><path d="M13 18h8" /></svg>
        Revisão
      </button>
      <button type="button" aria-pressed={followerView} onClick={() => setFollowerView(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
        Como seguidor
      </button>
    </nav>

    {/* No computador só esta área rola; cabeçalho, perfil e abas ficam parados. */}
    <div className={feedStyles.gridScroll} data-lenis-prevent>
      <div className={feedStyles.gridInner}>
        {batchOpen && counts.pending === 0 && <p role="status" className={feedStyles.doneBanner}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>
          <span><strong>Revisão concluída.</strong> {counts.approved} {plural(counts.approved, 'aprovada', 'aprovadas')}{counts.changes ? ` e ${counts.changes} ${plural(counts.changes, 'ajuste enviado', 'ajustes enviados')} à equipe` : ''}. Este é o feed como seus seguidores vão ver.</span>
        </p>}
        {reviewView && <p className={feedStyles.hint}>A mais recente aparece primeiro, como no seu perfil.</p>}

        <ul className={feedStyles.grid}>
          {gridPosts.map(({ post, index }) => {
            const state = reviewState(post.status)
            const label = [post.creative_code, post.title, shortDate(post.scheduled_at), STATUS_LABELS[state]].filter(Boolean).join(', ')
            return <li key={post.id}>
              <button type="button" className={feedStyles.tile} onClick={() => openPost(index)} aria-label={label}>
                <FeedThumb media={post.media} aspectRatio={post.aspect_ratio} />
                <FormatIcon post={post} />
                {reviewView && <StatusBadge state={state} />}
                {reviewView && <span className={feedStyles.tileDate}>{shortDate(post.scheduled_at)}</span>}
              </button>
            </li>
          })}
        </ul>

        {history.length > 0 && <>
          {reviewView && <p className={feedStyles.divider}>Envios anteriores</p>}
          <ul className={`${feedStyles.grid} ${feedStyles.historyGrid} ${reviewView ? feedStyles.historyDim : ''}`} aria-label="Publicações de envios anteriores">
            {history.map(post => <li key={post.id} className={feedStyles.historyTile}>
              <FeedThumb media={post.media} aspectRatio={post.aspect_ratio} />
              <FormatIcon post={post} />
            </li>)}
          </ul>
        </>}
      </div>
    </div>

    {current && openIndex !== null && <PortalPostDialog
      post={current}
      index={openIndex}
      total={posts.length}
      client={feed.client}
      handle={handle}
      batchOpen={batchOpen}
      submitting={decisionSubmitting}
      notice={notice}
      error={error}
      onDecision={submitDecision}
      onNavigate={openPost}
      onClose={closePost}
    />}
  </main>
}
