'use client'

import { DragEvent, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FeedThumb from './FeedThumb'
import PostPreview from './PostPreview'
import styles from './ContentHub.module.css'
import cropStyles from './CropControls.module.css'
import studio from './ContentStudio.module.css'
import { countHashtags, detectFormat, feedWindow, localDateKey, monthCells, nextCreativeCodes, nextFreeDateKey, profileOrder } from '@/lib/content-hub/feed-planner'
import { mediaStyle } from '@/lib/content-hub/media'
import type { ContentClient, ContentPost, MediaAsset, PostAspectRatio, PostFormat, PostStatus } from '@/lib/content-hub/types'
import { ASPECT_RATIO_CSS, ASPECT_RATIO_LABELS, POST_STATUS_LABELS } from '@/lib/content-hub/types'

interface MediaItem {
  key: string
  assetId?: string
  file?: File
  url: string
  mime_type: string
  crop_x: number
  crop_y: number
  zoom: number
  dirty: boolean
}

interface FormState {
  title: string
  creative_code: string
  date: string
  time: string
  format: PostFormat
  aspect_ratio: PostAspectRatio
  caption: string
  hashtags: string
  internal_notes: string
  status: PostStatus
  calendar_id: string
}

type SaveMode = 'draft' | 'review' | 'another' | 'published'

interface GridPost {
  id: string
  title: string
  creative_code?: string | null
  scheduled_at: string | null
  status: PostStatus
  aspect_ratio: PostAspectRatio
  media_assets: Array<{ url?: string; mime_type: string; crop_x?: number; crop_y?: number; zoom?: number; is_cover?: boolean }>
}

const CAPTION_LIMIT = 2200
const HASHTAG_LIMIT = 30
const DEFAULT_TIME = '18:00'
const MAX_FILE_SIZE = 50 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const FORMAT_LABELS: Record<PostFormat, string> = { image: 'Imagem única', carousel: 'Carrossel', video: 'Vídeo', reel: 'Reels' }

function emptyForm(calendarId = '', ratio: PostAspectRatio = '4:5', time = ''): FormState {
  return { title: '', creative_code: '', date: '', time, format: 'image', aspect_ratio: ratio, caption: '', hashtags: '', internal_notes: '', status: 'draft', calendar_id: calendarId }
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toLocalParts(iso: string | null) {
  if (!iso) return { date: '', time: '' }
  const date = new Date(iso)
  return { date: localDateKey(iso), time: `${pad(date.getHours())}:${pad(date.getMinutes())}` }
}

function toIso(date: string, time: string) {
  return date ? new Date(`${date}T${time || DEFAULT_TIME}`).toISOString() : null
}

function dayLabel(key: string) {
  const date = new Date(`${key}T12:00:00`)
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`
}

function shortDay(iso: string) {
  const date = new Date(iso)
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`
}

function postLabel(post: { creative_code?: string | null; title: string }) {
  return post.creative_code || post.title
}

function toItem(asset: MediaAsset): MediaItem {
  return { key: asset.id, assetId: asset.id, url: asset.url ?? '', mime_type: asset.mime_type, crop_x: Number(asset.crop_x ?? 50), crop_y: Number(asset.crop_y ?? 50), zoom: Number(asset.zoom ?? 1), dirty: false }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export default function PostEditor({ clientId, postId, initialCalendarId }: { clientId: string; postId?: string; initialCalendarId?: string }) {
  const router = useRouter()
  const [client, setClient] = useState<ContentClient | null>(null)
  const [clientPosts, setClientPosts] = useState<ContentPost[]>([])
  const [form, setForm] = useState<FormState>(() => emptyForm(initialCalendarId ?? ''))
  const [items, setItems] = useState<MediaItem[]>([])
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [formatTouched, setFormatTouched] = useState(false)
  const [reviews, setReviews] = useState<ContentPost['reviews']>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<SaveMode | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [dirty, setDirty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [month, setMonth] = useState('')
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [dropActive, setDropActive] = useState(false)
  const cropDrag = useRef<{ x: number; y: number; cropX: number; cropY: number } | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const clientRequest = fetch(`/api/admin/content/clients/${clientId}`).then(response => response.json())
    const postRequest = postId ? fetch(`/api/admin/content/posts/${postId}`).then(response => response.json()) : Promise.resolve(null)
    Promise.all([clientRequest, postRequest]).then(([clientData, postData]) => {
      if (!clientData.client) throw new Error(clientData.error || 'Cliente não encontrado.')
      const loadedClient = clientData.client as ContentClient
      setClient(loadedClient)
      setClientPosts([...(loadedClient.content_calendars ?? []).flatMap(calendar => calendar.posts), ...(loadedClient.posts ?? [])])
      if (postId) {
        if (!postData?.post) throw new Error(postData?.error || 'Publicação não encontrada.')
        const post = postData.post as ContentPost
        const { date, time } = toLocalParts(post.scheduled_at)
        setForm({ title: post.title, creative_code: post.creative_code ?? '', date, time, format: post.format, aspect_ratio: post.aspect_ratio ?? '1:1', caption: post.caption, hashtags: post.hashtags, internal_notes: post.internal_notes ?? '', status: post.status, calendar_id: post.calendar_id ?? '' })
        const loadedItems = (post.media_assets ?? []).map(toItem)
        setItems(loadedItems)
        setSelectedKey(loadedItems[0]?.key ?? null)
        setFormatTouched(true)
        setReviews(post.reviews ?? [])
        if (date) setMonth(date.slice(0, 7))
      }
    }).catch(cause => setError(cause instanceof Error ? cause.message : 'Erro ao abrir o editor.')).finally(() => setLoading(false))
  }, [clientId, postId])

  // Sair com alterações não salvas pede confirmação do navegador.
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const otherPosts = useMemo(() => clientPosts.filter(post => post.id !== postId && post.status !== 'archived'), [clientPosts, postId])
  const occupied = useMemo(() => {
    const days = new Map<string, ContentPost>()
    otherPosts.forEach(post => { if (post.scheduled_at) days.set(localDateKey(post.scheduled_at), post) })
    return days
  }, [otherPosts])
  const latestScheduled = useMemo(() => [...otherPosts].filter(post => post.scheduled_at).sort((a, b) => Date.parse(b.scheduled_at!) - Date.parse(a.scheduled_at!))[0], [otherPosts])
  const freeDay = useMemo(() => nextFreeDateKey([...occupied.keys()]), [occupied])
  const codeSuggestions = useMemo(() => nextCreativeCodes(otherPosts.map(post => post.creative_code)).slice(0, 3), [otherPosts])
  const selected = items.find(item => item.key === selectedKey) ?? null
  const selectedIndex = selected ? items.indexOf(selected) : -1

  const visibleMonth = month || (form.date || freeDay || localDateKey(new Date().toISOString())).slice(0, 7)
  const [monthYear, monthNumber] = visibleMonth.split('-').map(Number)
  const cells = useMemo(() => monthCells(monthYear, monthNumber - 1), [monthYear, monthNumber])

  function markDirty() {
    setDirty(true)
    setNotice('')
  }

  function setField<Key extends keyof FormState>(name: Key, value: FormState[Key]) {
    markDirty()
    setForm(previous => ({ ...previous, [name]: value }))
  }

  function applyItems(next: MediaItem[]) {
    setItems(next)
    markDirty()
    if (!formatTouched) setForm(previous => ({ ...previous, format: detectFormat(next, previous.aspect_ratio) }))
  }

  function setRatio(ratio: PostAspectRatio) {
    markDirty()
    setForm(previous => ({ ...previous, aspect_ratio: ratio, format: formatTouched ? previous.format : detectFormat(items, ratio) }))
  }

  function addFiles(list: FileList | null) {
    if (!list?.length) return
    const files = Array.from(list)
    const accepted = files.filter(file => ACCEPTED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE)
    if (accepted.length < files.length) setError('Alguns arquivos ficaram de fora: use JPG, PNG, WebP ou MP4 de até 50 MB.')
    if (!accepted.length) return
    const additions = accepted.map(file => ({ key: crypto.randomUUID(), file, url: URL.createObjectURL(file), mime_type: file.type, crop_x: 50, crop_y: 50, zoom: 1, dirty: false }))
    applyItems([...items, ...additions])
    setSelectedKey(additions[0].key)
  }

  function removeItem(key: string) {
    const item = items.find(entry => entry.key === key)
    if (!item) return
    if (item.assetId) setRemovedIds(previous => [...previous, item.assetId!])
    const next = items.filter(entry => entry.key !== key)
    applyItems(next)
    if (selectedKey === key) setSelectedKey(next[Math.max(0, items.indexOf(item) - 1)]?.key ?? null)
  }

  function moveItem(key: string, toIndex: number) {
    const fromIndex = items.findIndex(item => item.key === key)
    if (fromIndex < 0 || toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return
    const next = [...items]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    applyItems(next)
  }

  function updateSelected(values: Partial<Pick<MediaItem, 'crop_x' | 'crop_y' | 'zoom'>>) {
    if (!selectedKey) return
    markDirty()
    setItems(previous => previous.map(item => item.key === selectedKey ? { ...item, ...values, dirty: Boolean(item.assetId) } : item))
  }

  function startCropDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!selected) return
    event.currentTarget.setPointerCapture(event.pointerId)
    cropDrag.current = { x: event.clientX, y: event.clientY, cropX: selected.crop_x, cropY: selected.crop_y }
  }

  function moveCrop(event: React.PointerEvent<HTMLDivElement>) {
    if (!cropDrag.current || !selected) return
    const sensitivity = 0.35 / selected.zoom
    updateSelected({
      crop_x: clamp(cropDrag.current.cropX - (event.clientX - cropDrag.current.x) * sensitivity, 0, 100),
      crop_y: clamp(cropDrag.current.cropY - (event.clientY - cropDrag.current.y) * sensitivity, 0, 100),
    })
  }

  function onArtDragOver(event: DragEvent<HTMLElement>) {
    if (dragKey || !event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    setDropActive(true)
  }

  function onArtDrop(event: DragEvent<HTMLElement>) {
    if (dragKey || !event.dataTransfer.files.length) return
    event.preventDefault()
    setDropActive(false)
    addFiles(event.dataTransfer.files)
  }

  function applyFreeDay() {
    if (!freeDay) return
    const latestTime = latestScheduled?.scheduled_at ? toLocalParts(latestScheduled.scheduled_at).time : ''
    markDirty()
    setForm(previous => ({ ...previous, date: freeDay, time: previous.time || latestTime || DEFAULT_TIME }))
    setMonth(freeDay.slice(0, 7))
  }

  function pickDay(key: string) {
    markDirty()
    setForm(previous => ({ ...previous, date: key, time: previous.time || DEFAULT_TIME }))
  }

  function shiftMonth(step: number) {
    const date = new Date(Date.UTC(monthYear, monthNumber - 1 + step, 1))
    setMonth(date.toISOString().slice(0, 7))
  }

  async function save(mode: SaveMode) {
    if (saving) return
    if (!form.title.trim()) {
      setError('Dê um título interno à publicação para encontrá-la depois.')
      titleRef.current?.focus()
      return
    }
    if (mode === 'review' && !items.length) {
      setError('Adicione a arte antes de enviar para aprovação.')
      return
    }
    setSaving(mode)
    setError('')
    setNotice('')
    try {
      const status: PostStatus = mode === 'review' ? 'pending_review' : mode === 'published' ? 'published' : postId ? form.status : 'draft'
      const payload = {
        client_id: clientId,
        calendar_id: form.calendar_id || null,
        title: form.title,
        creative_code: form.creative_code.trim().toUpperCase() || null,
        scheduled_at: toIso(form.date, form.time),
        format: form.format,
        aspect_ratio: form.aspect_ratio,
        caption: form.caption,
        hashtags: form.hashtags,
        internal_notes: form.internal_notes || null,
        status,
      }
      const response = await fetch(postId ? `/api/admin/content/posts/${postId}` : '/api/admin/content/posts', { method: postId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar a publicação.')
      const savedId: string = postId ?? data.post.id

      for (const assetId of removedIds) {
        const removal = await fetch(`/api/admin/content/media/${assetId}`, { method: 'DELETE' })
        if (!removal.ok) throw new Error('A publicação foi salva, mas uma imagem removida não pôde ser apagada.')
      }

      const locals = items.filter(item => !item.assetId)
      let uploaded: MediaAsset[] = []
      if (locals.length) {
        const upload = new FormData()
        locals.forEach(item => upload.append('files', item.file!))
        upload.append('settings', JSON.stringify(locals.map(item => ({ crop_x: item.crop_x, crop_y: item.crop_y, zoom: item.zoom }))))
        const uploadResponse = await fetch(`/api/admin/content/posts/${savedId}/media`, { method: 'POST', body: upload })
        const uploadData = await uploadResponse.json()
        if (!uploadResponse.ok) throw new Error(uploadData.error || 'A publicação foi salva, mas as imagens não foram enviadas.')
        uploaded = uploadData.media
      }
      const uploadedByKey = new Map(locals.map((item, index) => [item.key, uploaded[index]]))
      const saved = items.map(item => {
        const asset = item.assetId ? undefined : uploadedByKey.get(item.key)
        return asset ? { ...item, key: asset.id, assetId: asset.id, url: asset.url ?? item.url, file: undefined } : item
      })

      if (saved.length > 1) {
        const order = await fetch(`/api/admin/content/posts/${savedId}/media`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ asset_ids: saved.map(item => item.assetId) }) })
        if (!order.ok) throw new Error('A publicação foi salva, mas a ordem das imagens não.')
      }
      for (const item of saved.filter(entry => entry.dirty && entry.assetId)) {
        const crop = await fetch(`/api/admin/content/media/${item.assetId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ crop_x: item.crop_x, crop_y: item.crop_y, zoom: item.zoom }) })
        if (!crop.ok) throw new Error('A publicação foi salva, mas o corte de uma imagem não.')
      }

      const finalItems = saved.map(item => ({ ...item, dirty: false }))
      const savedPost = { ...data.post, media_assets: finalItems.map((item, position) => ({ id: item.assetId!, storage_path: '', mime_type: item.mime_type, position, is_cover: position === 0, crop_x: item.crop_x, crop_y: item.crop_y, zoom: item.zoom, url: item.url })) } as ContentPost
      setClientPosts(previous => [...previous.filter(post => post.id !== savedId), savedPost])
      setItems(finalItems)
      setSelectedKey(current => finalItems.find(item => item.key === current)?.key ?? uploaded[0]?.id ?? finalItems[0]?.key ?? null)
      setRemovedIds([])
      setDirty(false)
      setForm(previous => ({ ...previous, status }))

      if (mode === 'another') {
        if (postId) {
          router.push(`/admin/clientes/${clientId}/posts/novo${form.calendar_id ? `?calendar=${form.calendar_id}` : ''}`)
          return
        }
        const savedTitle = form.title
        setForm(previous => emptyForm(previous.calendar_id, previous.aspect_ratio, previous.time))
        setItems([])
        setSelectedKey(null)
        setFormatTouched(false)
        setNotice(`“${savedTitle}” foi salva como rascunho. Pode montar a próxima.`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      setNotice(mode === 'review'
        ? 'Enviada para aprovação. Se o cronograma já está liberado no portal, a cliente já consegue ver.'
        : mode === 'published' ? 'Marcada como publicada.' : postId ? 'Alterações salvas.' : 'Rascunho salvo.')
      if (!postId) router.replace(`/admin/clientes/${clientId}/posts/${savedId}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a publicação.')
    } finally {
      setSaving(null)
    }
  }

  async function deletePost() {
    if (!postId) return
    if (!confirmDelete) return setConfirmDelete(true)
    const response = await fetch(`/api/admin/content/posts/${postId}`, { method: 'DELETE' })
    if (response.ok) { setDirty(false); router.push(`/admin/clientes/${clientId}`); router.refresh() }
    else { setError('Não foi possível excluir a publicação.'); setConfirmDelete(false) }
  }

  const previewMedia = useMemo(() => items.map(item => ({ id: item.key, url: item.url, mime_type: item.mime_type, crop_x: item.crop_x, crop_y: item.crop_y, zoom: item.zoom })), [items])
  const scheduledAt = toIso(form.date, form.time)
  const previewPost = { ...form, scheduled_at: scheduledAt, media_assets: previewMedia }
  const currentId = postId ?? 'nova-publicacao'
  const placement = useMemo(() => {
    if (!scheduledAt) return null
    const current: GridPost = { id: currentId, title: form.title || 'Esta publicação', creative_code: form.creative_code, scheduled_at: scheduledAt, status: form.status, aspect_ratio: form.aspect_ratio, media_assets: previewMedia }
    const others: GridPost[] = otherPosts.map(post => ({ id: post.id, title: post.title, creative_code: post.creative_code, scheduled_at: post.scheduled_at, status: post.status, aspect_ratio: post.aspect_ratio ?? '1:1', media_assets: post.media_assets ?? [] }))
    return feedWindow(profileOrder([...others, current]).grid, currentId)
  }, [currentId, form.aspect_ratio, form.creative_code, form.status, form.title, otherPosts, previewMedia, scheduledAt])

  const captionCount = form.caption.length
  const hashtagCount = countHashtags(form.caption, form.hashtags)
  const dayConflict = form.date ? occupied.get(form.date) : undefined
  const latestReview = reviews?.[0]
  const resend = ['changes_requested', 'in_progress', 'approved'].includes(form.status)
  const statusNote = !postId ? 'Rascunho · a cliente ainda não vê'
    : form.status === 'pending_review' ? `${POST_STATUS_LABELS[form.status]} · a cliente já pode ver`
    : form.status === 'changes_requested' ? `${POST_STATUS_LABELS[form.status]} · a cliente pediu ajuste`
    : POST_STATUS_LABELS[form.status]

  let placementText = 'Sem data, a peça ainda não tem lugar na grade. Escolha a data em “Quando e onde”.'
  if (placement && placement.index >= 0) {
    const { newer, older } = placement
    if (!newer) placementText = older ? `Entra no topo do feed, antes de ${postLabel(older)} (${shortDay(older.scheduled_at!)}).` : 'Entra no topo do feed.'
    else placementText = older ? `Fica entre ${postLabel(newer)} (${shortDay(newer.scheduled_at!)}) e ${postLabel(older)} (${shortDay(older.scheduled_at!)}).` : `Fica logo depois de ${postLabel(newer)} (${shortDay(newer.scheduled_at!)}).`
  }

  if (loading) return <div className={styles.loading}><span className={styles.spin} /><br />Preparando o editor…</div>

  return (
    <div className={styles.hub}>
      <Link className={styles.backLink} href={`/admin/clientes/${clientId}`}>← {client?.name ?? 'Voltar para o cliente'}</Link>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}>Mesa de criação</div>
          <h1 className={styles.pageTitle}>{postId ? 'Editar publicação' : 'Nova publicação'}</h1>
          <p className={styles.pageSubtitle}>Comece pela arte. A prévia e o lugar na grade se atualizam enquanto você monta.</p>
        </div>
        <span className={studio.statusPill}><span className={`${studio.statusDot} ${studio[`dot_${postId ? form.status : 'draft'}`] ?? ''}`} />{statusNote}</span>
      </div>
      {error && <div className={styles.errorBox} role="alert">{error}</div>}
      {notice && <div className={styles.successBox} role="status">{notice}</div>}
      {latestReview && <div className={latestReview.decision === 'approved' ? styles.successBox : styles.errorBox}><strong>{latestReview.decision === 'approved' ? 'Aprovada pela cliente' : 'A cliente pediu ajuste'}</strong>{latestReview.reviewer_name && <> · {latestReview.reviewer_name}</>}{latestReview.comment && <div style={{ marginTop: 7, lineHeight: 1.6 }}>{latestReview.comment}</div>}</div>}

      <div className={studio.studio}>
        <div className={studio.studioMain}>
          <section className={`${studio.step} ${dropActive ? studio.stepDrop : ''}`} aria-labelledby="step-art" onDragOver={onArtDragOver} onDragLeave={() => setDropActive(false)} onDrop={onArtDrop}>
            <header className={studio.stepHeader}>
              <h2 id="step-art" className={studio.stepTitle}>01 · Arte</h2>
              {items.length > 0 && <span className={studio.detected}>{FORMAT_LABELS[form.format]}{form.format === 'carousel' ? ` · ${items.length} imagens` : ''}<span> · {formatTouched ? 'escolhido' : 'detectado'}</span></span>}
            </header>

            {!items.length ? <label className={studio.dropzone}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
              <strong>Arraste as imagens ou o vídeo para cá</strong>
              <span>ou clique para escolher · JPG, PNG, WebP ou MP4 até 50 MB · várias imagens viram carrossel</span>
              <input className={studio.visuallyHidden} type="file" multiple accept={ACCEPTED_TYPES.join(',')} onChange={event => { addFiles(event.target.files); event.target.value = '' }} />
            </label> : <>
              <ol className={studio.filmstrip} aria-label="Ordem das imagens">
                {items.map((item, index) => <li key={item.key}>
                  <button
                    type="button"
                    className={`${studio.filmThumb} ${item.key === selectedKey ? studio.filmThumbSelected : ''}`}
                    style={{ aspectRatio: ASPECT_RATIO_CSS[form.aspect_ratio] }}
                    draggable
                    aria-pressed={item.key === selectedKey}
                    aria-label={`Imagem ${index + 1}${index === 0 ? ', capa' : ''}. Selecionar para ajustar o corte`}
                    onClick={() => setSelectedKey(item.key)}
                    onDragStart={event => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', item.key); setDragKey(item.key) }}
                    onDragOver={event => { if (dragKey && dragKey !== item.key) event.preventDefault() }}
                    onDrop={event => { event.preventDefault(); if (dragKey) moveItem(dragKey, index); setDragKey(null) }}
                    onDragEnd={() => setDragKey(null)}
                  >
                    {item.mime_type.startsWith('video/') ? <video src={item.url} style={mediaStyle(item)} muted /> :
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} style={mediaStyle(item)} alt="" />}
                  </button>
                  <span className={studio.filmIndex}>{index === 0 ? '1 · Capa' : index + 1}{!item.assetId && ' · nova'}</span>
                </li>)}
                <li>
                  <label className={studio.filmAdd} style={{ aspectRatio: ASPECT_RATIO_CSS[form.aspect_ratio] }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                    Adicionar
                    <input className={studio.visuallyHidden} type="file" multiple accept={ACCEPTED_TYPES.join(',')} onChange={event => { addFiles(event.target.files); event.target.value = '' }} />
                  </label>
                </li>
              </ol>
              <p className={studio.stepHint}>Arraste as miniaturas para mudar a ordem. A primeira é a capa. Solte arquivos em qualquer lugar deste bloco.</p>

              {selected && <div className={studio.cropArea}>
                <div className={studio.cropColumn}>
                  <div className={cropStyles.cropFrame} style={{ aspectRatio: ASPECT_RATIO_CSS[form.aspect_ratio] }} onPointerDown={startCropDrag} onPointerMove={moveCrop} onPointerUp={() => { cropDrag.current = null }} onPointerCancel={() => { cropDrag.current = null }}>
                    {selected.mime_type.startsWith('video/') ? <video src={selected.url} style={mediaStyle(selected)} muted /> :
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selected.url} style={mediaStyle(selected)} alt={`Imagem ${selectedIndex + 1} no enquadramento`} />}
                    <span className={cropStyles.cropGrid} />
                  </div>
                  <span className={studio.cropCaption}>Arraste a imagem para reposicionar · imagem {selectedIndex + 1} de {items.length}</span>
                </div>
                <div className={studio.cropControls}>
                  <fieldset className={studio.fieldset}>
                    <legend className={studio.controlLabel}>Proporção</legend>
                    <div className={studio.ratioList}>{(['1:1', '4:5', '9:16'] as PostAspectRatio[]).map(ratio => <button className={`${cropStyles.ratioButton} ${form.aspect_ratio === ratio ? cropStyles.ratioButtonActive : ''}`} key={ratio} type="button" aria-pressed={form.aspect_ratio === ratio} onClick={() => setRatio(ratio)}><span className={ratio === '1:1' ? cropStyles.squareIcon : ratio === '4:5' ? cropStyles.portraitIcon : cropStyles.verticalIcon} />{ASPECT_RATIO_LABELS[ratio]}</button>)}</div>
                  </fieldset>
                  <div className={cropStyles.sliderField}><label htmlFor="crop-zoom">Zoom <output>{selected.zoom.toFixed(2)}×</output></label><input id="crop-zoom" type="range" min="1" max="3" step="0.05" value={selected.zoom} onChange={event => updateSelected({ zoom: Number(event.target.value) })} /></div>
                  <div className={cropStyles.sliderField}><label htmlFor="crop-x">Horizontal <output>{Math.round(selected.crop_x)}%</output></label><input id="crop-x" type="range" min="0" max="100" value={selected.crop_x} onChange={event => updateSelected({ crop_x: Number(event.target.value) })} /></div>
                  <div className={cropStyles.sliderField}><label htmlFor="crop-y">Vertical <output>{Math.round(selected.crop_y)}%</output></label><input id="crop-y" type="range" min="0" max="100" value={selected.crop_y} onChange={event => updateSelected({ crop_y: Number(event.target.value) })} /></div>
                  <div className={studio.controlRow}>
                    <button className={studio.smallButton} type="button" onClick={() => updateSelected({ crop_x: 50, crop_y: 50, zoom: 1 })}>Centralizar</button>
                    <button className={studio.smallButton} type="button" disabled={selectedIndex <= 0} onClick={() => moveItem(selected.key, selectedIndex - 1)} aria-label="Mover imagem para a esquerda">←</button>
                    <button className={studio.smallButton} type="button" disabled={selectedIndex >= items.length - 1} onClick={() => moveItem(selected.key, selectedIndex + 1)} aria-label="Mover imagem para a direita">→</button>
                    <button className={`${studio.smallButton} ${studio.smallDanger}`} type="button" onClick={() => removeItem(selected.key)}>Remover</button>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="post-format">Formato</label>
                    <select id="post-format" value={form.format} onChange={event => { setFormatTouched(true); setField('format', event.target.value as PostFormat) }}>
                      {(Object.keys(FORMAT_LABELS) as PostFormat[]).map(format => <option key={format} value={format}>{FORMAT_LABELS[format]}</option>)}
                    </select>
                  </div>
                  <p className={studio.note}>O corte é salvo junto com a publicação. Não há um botão separado para ele.</p>
                </div>
              </div>}
            </>}
          </section>

          <section className={studio.step} aria-labelledby="step-caption">
            <header className={studio.stepHeader}>
              <h2 id="step-caption" className={studio.stepTitle}>02 · Legenda</h2>
              <span className={`${studio.counter} ${captionCount > CAPTION_LIMIT ? studio.counterOver : ''}`}>{captionCount.toLocaleString('pt-BR')} / {CAPTION_LIMIT.toLocaleString('pt-BR')}</span>
            </header>
            <div className={styles.field}>
              <label htmlFor="caption">Texto da legenda</label>
              <textarea id="caption" style={{ minHeight: 160 }} value={form.caption} onChange={event => setField('caption', event.target.value)} placeholder="Escreva a legenda que acompanha a publicação…" />
              <span className={styles.fieldHint}>No feed, só os primeiros 125 caracteres aparecem antes do “mais”. A prévia ao lado mostra onde o corte cai.</span>
            </div>
            <div className={styles.field}>
              <label htmlFor="hashtags" className={studio.labelRow}>Hashtags<span className={hashtagCount > HASHTAG_LIMIT ? studio.counterOver : studio.counter}>{hashtagCount} / {HASHTAG_LIMIT}</span></label>
              <input id="hashtags" value={form.hashtags} onChange={event => setField('hashtags', event.target.value)} placeholder="#marca #campanha" />
            </div>
          </section>

          <section className={studio.step} aria-labelledby="step-when">
            <h2 id="step-when" className={studio.stepTitle}>03 · Quando e onde</h2>
            <div className={styles.field}>
              <label htmlFor="post-title">Título interno</label>
              <input id="post-title" ref={titleRef} required value={form.title} onChange={event => setField('title', event.target.value)} placeholder="Ex.: Carrossel — documentos para a escritura" />
              <span className={styles.fieldHint}>Só a equipe vê. É como a peça aparece na agenda e nas listas.</span>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="post-code">Código da peça</label>
                <input id="post-code" value={form.creative_code} onChange={event => setField('creative_code', event.target.value.toUpperCase())} pattern="[A-Za-z0-9][A-Za-z0-9-]{0,23}" maxLength={24} placeholder="Ex.: C08" />
                {!form.creative_code && codeSuggestions.length > 0 && <div className={studio.suggestions}><span>Próximos:</span>{codeSuggestions.map(code => <button key={code} className={studio.suggestionChip} type="button" onClick={() => setField('creative_code', code)}>{code}</button>)}</div>}
              </div>
              <div className={styles.field}>
                <label htmlFor="post-calendar">Cronograma</label>
                <select id="post-calendar" value={form.calendar_id} onChange={event => setField('calendar_id', event.target.value)}><option value="">Publicação avulsa</option>{client?.content_calendars?.map(calendar => <option value={calendar.id} key={calendar.id}>{calendar.name}</option>)}</select>
              </div>
            </div>

            <div className={studio.schedule}>
              <div className={studio.scheduleFields}>
                <div className={studio.dateRow}>
                  <div className={styles.field}><label htmlFor="post-date">Data</label><input id="post-date" type="date" value={form.date} onChange={event => { setField('date', event.target.value); if (event.target.value) setMonth(event.target.value.slice(0, 7)) }} /></div>
                  <div className={styles.field}><label htmlFor="post-time">Horário</label><input id="post-time" type="time" value={form.time} onChange={event => setField('time', event.target.value)} /></div>
                </div>
                {!form.date && freeDay && <div className={studio.freeSlot}>
                  <p><strong>Próxima vaga livre: {dayLabel(freeDay)}.</strong>{latestScheduled && <> A última peça agendada é {postLabel(latestScheduled)}, em {shortDay(latestScheduled.scheduled_at!)}.</>}</p>
                  <button className={studio.smallButton} type="button" onClick={applyFreeDay}>Usar esta data</button>
                </div>}
                {dayConflict && <p className={studio.slotWarning}>Já existe publicação neste dia: {postLabel(dayConflict)}{dayConflict.creative_code ? ` · ${dayConflict.title}` : ''}.</p>}
              </div>

              <div className={studio.calendar}>
                <div className={studio.calendarHead}>
                  <button type="button" className={studio.calendarNav} onClick={() => shiftMonth(-1)} aria-label="Mês anterior">‹</button>
                  <strong>{MONTHS[monthNumber - 1]} de {monthYear}</strong>
                  <button type="button" className={studio.calendarNav} onClick={() => shiftMonth(1)} aria-label="Próximo mês">›</button>
                </div>
                <div className={studio.calendarGrid}>
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((letter, index) => <span key={index} className={studio.calendarWeekday} aria-hidden="true">{letter}</span>)}
                  {cells.map((key, index) => {
                    if (!key) return <span key={`vazio-${index}`} />
                    const busy = occupied.get(key)
                    const isSelected = key === form.date
                    return <button key={key} type="button" className={`${studio.calendarDay} ${busy ? studio.calendarDayBusy : ''} ${isSelected ? studio.calendarDaySelected : ''}`} aria-pressed={isSelected} aria-label={`${Number(key.slice(8))} de ${MONTHS[monthNumber - 1]}${busy ? `, já tem ${postLabel(busy)}` : ''}`} title={busy ? `${postLabel(busy)} · ${busy.title}` : undefined} onClick={() => pickDay(key)}>{Number(key.slice(8))}</button>
                  })}
                </div>
                <span className={studio.calendarLegend}><span aria-hidden="true" /> dia com publicação</span>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="internal-notes">Observações internas</label>
              <textarea id="internal-notes" value={form.internal_notes} onChange={event => setField('internal_notes', event.target.value)} placeholder="A cliente não vê este campo." />
            </div>
          </section>

          <div className={studio.actionBar}>
            <div className={studio.actionState}>
              {postId && <button className={styles.dangerButton} type="button" onClick={deletePost}>{confirmDelete ? 'Confirmar exclusão' : 'Excluir'}</button>}
              <span>{dirty ? 'Alterações não salvas' : postId ? 'Tudo salvo' : 'Ainda não salva'}</span>
            </div>
            <div className={studio.actionButtons}>
              {postId && form.status === 'approved' && <button className={styles.quietButton} type="button" disabled={Boolean(saving)} onClick={() => save('published')}>{saving === 'published' ? 'Salvando…' : 'Marcar como publicada'}</button>}
              <button className={styles.quietButton} type="button" disabled={Boolean(saving)} onClick={() => save('draft')}>{saving === 'draft' ? 'Salvando…' : postId ? 'Salvar alterações' : 'Salvar rascunho'}</button>
              <button className={studio.anotherButton} type="button" disabled={Boolean(saving)} onClick={() => save('another')}>{saving === 'another' ? 'Salvando…' : 'Salvar e criar outra'}</button>
              {form.status !== 'published' && <button className={styles.primaryButton} type="button" disabled={Boolean(saving) || !items.length} onClick={() => save('review')}>{saving === 'review' ? 'Enviando…' : resend ? 'Reenviar para aprovação →' : 'Enviar para aprovação →'}</button>}
            </div>
          </div>
        </div>

        <aside className={studio.studioSide}>
          <section className={studio.sideCard} aria-label="Prévia no feed">
            <div className={studio.sideHeader}><strong>Prévia no feed</strong><span>Como a cliente vai ver</span></div>
            <PostPreview post={previewPost} client={{ name: client?.name ?? 'Cliente', instagram: client?.instagram, avatar_url: client?.avatar_url }} captionLimit={125} />
          </section>
          <section className={studio.sideCard} aria-label="Lugar na grade">
            <div className={studio.sideHeader}><strong>Na grade</strong></div>
            <p className={studio.placementText}>{placementText}</p>
            {placement && placement.items.length > 0 && <ul className={studio.miniGrid}>
              {placement.items.map(post => <li key={post.id} className={`${studio.miniTile} ${post.id === currentId ? studio.miniTileCurrent : ''}`}>
                <FeedThumb media={post.media_assets} aspectRatio={post.aspect_ratio} />
                {post.id === currentId
                  ? <span className={studio.miniTileLabel}>{postId ? 'Esta' : 'Nova'} · {shortDay(post.scheduled_at!)}</span>
                  : <span className={studio.miniTileDay}>{shortDay(post.scheduled_at!)}</span>}
              </li>)}
            </ul>}
          </section>
        </aside>
      </div>
    </div>
  )
}
