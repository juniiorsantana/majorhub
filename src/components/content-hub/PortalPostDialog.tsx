'use client'

import { CSSProperties, FormEvent, KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react'
import FeedThumb from './FeedThumb'
import MediaCarousel from './MediaCarousel'
import { InstagramActions } from './PostPreview'
import styles from './PortalFeed.module.css'
import { correctionComment, correctionTargets, formatLabel, gridCropNote, reviewState } from '@/lib/content-hub/portal-feed'
import { ASPECT_RATIO_LABELS, ASPECT_RATIO_VALUE } from '@/lib/content-hub/types'
import type { PortalClient, PortalPost, ReviewDecision } from './portal-types'

interface PortalPostDialogProps {
  post: PortalPost
  index: number
  total: number
  client: PortalClient
  handle: string
  batchOpen: boolean
  submitting: ReviewDecision | null
  notice: string
  error: string
  onDecision: (decision: ReviewDecision, comment: string | null) => Promise<boolean>
  onNavigate: (index: number) => void
  onClose: () => void
}

const STATUS_CHIPS = {
  pending: { label: 'A revisar', className: styles.chipPending },
  approved: { label: 'Aprovada', className: styles.chipApproved },
  changes: { label: 'Ajuste pedido', className: styles.chipChanges },
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

function formatDay(value: string | null) {
  if (!value) return 'Data a definir'
  return new Date(value).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} /></svg>
}

function CheckIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
}

export default function PortalPostDialog(props: PortalPostDialogProps) {
  const { post, index, total, onNavigate, onClose } = props
  const dialogRef = useRef<HTMLDialogElement>(null)
  const hasPrevious = index > 0
  const hasNext = index < total - 1
  const title = `Publicação ${pad(index + 1)} de ${pad(total)}`

  // O dialog nativo prende o foco na janela e deixa a grade inerte por trás.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if ((event.target as HTMLElement).closest('textarea, input')) return
    if (event.key === 'ArrowLeft' && hasPrevious) { event.preventDefault(); onNavigate(index - 1) }
    if (event.key === 'ArrowRight' && hasNext) { event.preventDefault(); onNavigate(index + 1) }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={`${title}: ${post.title}`}
      onCancel={event => { event.preventDefault(); onClose() }}
      onKeyDown={onKeyDown}
      style={{ '--media-ratio': ASPECT_RATIO_VALUE[post.aspect_ratio] } as CSSProperties}
      data-lenis-prevent
    >
      <div className={styles.dialogBackdrop} onClick={onClose} aria-hidden="true" />

      <div className={styles.topBar}>
        <button type="button" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
          Grade
        </button>
        <div className={styles.topTitle}><strong>{title}</strong><span>{post.creative_code || formatDay(post.scheduled_at)}</span></div>
        <div className={styles.topNav}>
          <button type="button" aria-label="Publicação anterior" disabled={!hasPrevious} onClick={() => onNavigate(index - 1)}><ChevronIcon direction="left" /></button>
          <button type="button" aria-label="Próxima publicação" disabled={!hasNext} onClick={() => onNavigate(index + 1)}><ChevronIcon direction="right" /></button>
        </div>
      </div>

      <button type="button" className={styles.dialogClose} aria-label="Fechar publicação" onClick={onClose}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      </button>
      {hasPrevious && <button type="button" className={`${styles.dialogArrow} ${styles.dialogArrowPrev}`} aria-label="Publicação anterior" onClick={() => onNavigate(index - 1)}><ChevronIcon direction="left" /></button>}
      {hasNext && <button type="button" className={`${styles.dialogArrow} ${styles.dialogArrowNext}`} aria-label="Próxima publicação" onClick={() => onNavigate(index + 1)}><ChevronIcon direction="right" /></button>}

      <PostSheet key={post.id} {...props} title={title} hasNext={hasNext} />
    </dialog>
  )
}

function PostSheet({ post, index, client, handle, batchOpen, submitting, notice, error, onDecision, onNavigate, onClose, title, hasNext }: PortalPostDialogProps & { title: string; hasNext: boolean }) {
  const [slide, setSlide] = useState(0)
  const [correctionOpen, setCorrectionOpen] = useState(false)
  const [target, setTarget] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  const state = reviewState(post.status)
  const chip = STATUS_CHIPS[state]
  const mediaCount = post.media.length
  const format = formatLabel(post.format, mediaCount)
  const meta = [post.creative_code, format, `versão ${post.current_version}`].filter(Boolean).join(' · ')
  const caption = post.caption?.trim()
  const correctionId = `correction-${post.id}`

  function openCorrection() {
    setTarget(mediaCount > 1 ? `Imagem ${slide + 1}` : null)
    setCorrectionOpen(true)
  }

  async function sendCorrection(event: FormEvent) {
    event.preventDefault()
    if (!comment.trim() || submitting) return
    if (await onDecision('changes_requested', correctionComment(target, comment))) {
      setCorrectionOpen(false)
      setComment('')
    }
  }

  const nextButton = <button type="button" className={styles.nextButton} onClick={hasNext ? () => onNavigate(index + 1) : onClose}>{hasNext ? 'Próxima' : 'Ver grade'}</button>

  let decision: ReactNode
  if (submitting) {
    decision = <p role="status" className={`${styles.decisionStatus} ${styles.statusSaving}`}>{submitting === 'approved' ? 'Aprovando publicação…' : 'Enviando ajuste…'}</p>
  } else if (notice) {
    decision = <p role="status" className={`${styles.decisionStatus} ${state === 'changes' ? styles.statusChanges : styles.statusApproved}`}>{notice}</p>
  } else if (!batchOpen) {
    decision = <div className={styles.resolved}><p className={`${styles.resolvedText} ${styles.resolvedNeutral}`}><strong>Envio encerrado</strong><span>Disponível apenas para consulta.</span></p>{nextButton}</div>
  } else if (state === 'approved') {
    decision = <div className={styles.resolved}><p className={`${styles.resolvedText} ${styles.resolvedApproved}`}><strong>✓ Publicação aprovada</strong><span>Sua aprovação já foi registrada.</span></p>{nextButton}</div>
  } else if (state === 'changes') {
    decision = <div className={styles.resolved}><p className={`${styles.resolvedText} ${styles.resolvedChanges}`}><strong>Ajuste pedido</strong><span>{post.latest_review?.comment || 'A equipe da Major Hub recebeu seu pedido.'}</span></p>{nextButton}</div>
  } else if (correctionOpen) {
    decision = <form className={styles.correction} onSubmit={sendCorrection}>
      <h2 className={styles.correctionTitle}>O que precisa mudar?</h2>
      <fieldset className={styles.targets}>
        <legend>Onde está o ajuste</legend>
        <div>{correctionTargets(post.format, mediaCount).map(item => <button type="button" key={item} aria-pressed={target === item} onClick={() => setTarget(current => current === item ? null : item)}>{item}</button>)}</div>
      </fieldset>
      <label htmlFor={correctionId}>Descreva o ajuste</label>
      <textarea id={correctionId} autoFocus maxLength={2950} value={comment} onChange={event => setComment(event.target.value)} placeholder="Ex.: trocar a foto da capa por uma da fachada." />
      <div className={styles.correctionActions}>
        <button type="button" className={styles.cancelButton} onClick={() => setCorrectionOpen(false)}>Cancelar</button>
        <button type="submit" className={styles.sendButton} disabled={!comment.trim()}>Enviar ajuste</button>
      </div>
    </form>
  } else {
    decision = <>
      <p className={styles.decisionMeta}>{meta}</p>
      <div className={styles.decisionButtons}>
        <button type="button" className={styles.adjustButton} onClick={openCorrection}>Pedir ajuste</button>
        <button type="button" className={styles.approveButton} onClick={() => onDecision('approved', null)}><CheckIcon />Aprovar</button>
      </div>
    </>
  }

  return (
    <article className={styles.post}>
      <header className={styles.postHead}>
        {client.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.postAvatar} src={client.avatar_url} alt="" />
        ) : <span className={styles.postAvatar} aria-hidden="true">{initials(client.name)}</span>}
        <div className={styles.postIdentity}><strong>{handle}</strong><span>Programada · {formatDay(post.scheduled_at)}</span></div>
        <span className={`${styles.chip} ${chip.className}`}>{chip.label}</span>
      </header>

      <div className={styles.postMedia}>
        <MediaCarousel media={post.media} aspectRatio={post.aspect_ratio} emptyLabel="Arte ainda não enviada" onSlideChange={setSlide} />
      </div>

      <div className={styles.postBody}>
        <InstagramActions className={styles.igIcons} />
        {(caption || post.hashtags) && <p className={styles.caption}><strong>{handle}</strong>{caption}{post.hashtags && <span className={styles.tags}>{post.hashtags}</span>}</p>}

        <section className={styles.details}>
          <h2>Detalhes da peça</h2>
          <dl>
            {post.creative_code && <><dt>Código</dt><dd>{post.creative_code}</dd></>}
            <dt>Formato</dt><dd>{format}</dd>
            <dt>Proporção</dt><dd>{ASPECT_RATIO_LABELS[post.aspect_ratio]}</dd>
            <dt>Versão</dt><dd>{post.current_version}</dd>
            <dt>Ordem</dt><dd>{title}</dd>
          </dl>
        </section>

        <div className={styles.cropPreview}>
          <span className={styles.cropThumb}><FeedThumb media={post.media} aspectRatio={post.aspect_ratio} /></span>
          <p><strong>Como aparece na grade</strong><span>{gridCropNote(post.aspect_ratio)}</span></p>
        </div>
      </div>

      <div className={styles.decision} data-mode={correctionOpen && !submitting && !notice ? 'correction' : undefined}>
        {decision}
        {error && <p role="alert" className={styles.decisionError}>{error}</p>}
      </div>
    </article>
  )
}
