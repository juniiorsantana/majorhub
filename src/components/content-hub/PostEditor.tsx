'use client'

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ContentClient, ContentPost, MediaAsset, PostAspectRatio, PostFormat, PostStatus } from '@/lib/content-hub/types'
import { POST_STATUS_LABELS } from '@/lib/content-hub/types'
import PostPreview from './PostPreview'
import styles from './ContentHub.module.css'
import cropStyles from './CropControls.module.css'

interface LocalMedia {
  id: string
  file: File
  url: string
  mime_type: string
  crop_x: number
  crop_y: number
  zoom: number
}

interface FormState {
  title: string
  scheduled_at: string
  format: PostFormat
  aspect_ratio: PostAspectRatio
  caption: string
  hashtags: string
  internal_notes: string
  status: PostStatus
  calendar_id: string
}

const emptyForm: FormState = { title: '', scheduled_at: '', format: 'image', aspect_ratio: '1:1', caption: '', hashtags: '', internal_notes: '', status: 'draft', calendar_id: '' }

function toLocalDateTime(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function cropStyle(asset: MediaAsset | LocalMedia): CSSProperties {
  return { objectPosition: `${Number(asset.crop_x ?? 50)}% ${Number(asset.crop_y ?? 50)}%`, transform: `scale(${Number(asset.zoom ?? 1)})` }
}

export default function PostEditor({ clientId, postId, initialCalendarId }: { clientId: string; postId?: string; initialCalendarId?: string }) {
  const router = useRouter()
  const [client, setClient] = useState<ContentClient | null>(null)
  const [form, setForm] = useState<FormState>({ ...emptyForm, calendar_id: initialCalendarId ?? '' })
  const [media, setMedia] = useState<MediaAsset[]>([])
  const [localMedia, setLocalMedia] = useState<LocalMedia[]>([])
  const [reviews, setReviews] = useState<ContentPost['reviews']>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cropSaving, setCropSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const dragRef = useRef<{ x: number; y: number; cropX: number; cropY: number } | null>(null)

  useEffect(() => {
    const clientRequest = fetch(`/api/admin/content/clients/${clientId}`).then(response => response.json())
    const postRequest = postId ? fetch(`/api/admin/content/posts/${postId}`).then(response => response.json()) : Promise.resolve(null)
    Promise.all([clientRequest, postRequest]).then(([clientData, postData]) => {
      if (!clientData.client) throw new Error(clientData.error || 'Cliente não encontrado.')
      setClient(clientData.client)
      if (postId) {
        if (!postData?.post) throw new Error(postData?.error || 'Publicação não encontrada.')
        const post = postData.post as ContentPost
        setForm({ title: post.title, scheduled_at: toLocalDateTime(post.scheduled_at), format: post.format, aspect_ratio: post.aspect_ratio ?? '1:1', caption: post.caption, hashtags: post.hashtags, internal_notes: post.internal_notes ?? '', status: post.status, calendar_id: post.calendar_id ?? '' })
        const normalized = (post.media_assets ?? []).map(asset => ({ ...asset, crop_x: Number(asset.crop_x ?? 50), crop_y: Number(asset.crop_y ?? 50), zoom: Number(asset.zoom ?? 1) }))
        setMedia(normalized)
        setSelectedId(normalized[0]?.id ?? null)
        setReviews(post.reviews ?? [])
      }
    }).catch(cause => setError(cause instanceof Error ? cause.message : 'Erro ao abrir o editor.')).finally(() => setLoading(false))
  }, [clientId, postId])

  function setField<Key extends keyof FormState>(name: Key, value: FormState[Key]) {
    setSavedMessage('')
    setForm(previous => ({ ...previous, [name]: value }))
  }

  function addFiles(files: FileList | null) {
    if (!files) return
    const additions = Array.from(files).map(file => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file), mime_type: file.type, crop_x: 50, crop_y: 50, zoom: 1 }))
    setLocalMedia(previous => [...previous, ...additions])
    setSelectedId(additions[0]?.id ?? selectedId)
    if (media.length + localMedia.length + additions.length > 1 && form.format === 'image') setField('format', 'carousel')
  }

  const selected = useMemo(() => media.find(asset => asset.id === selectedId) ?? localMedia.find(asset => asset.id === selectedId) ?? null, [localMedia, media, selectedId])
  const selectedIsLocal = Boolean(selectedId && localMedia.some(asset => asset.id === selectedId))

  function updateSelected(values: Partial<Pick<LocalMedia, 'crop_x' | 'crop_y' | 'zoom'>>) {
    if (!selectedId) return
    setMedia(previous => previous.map(asset => asset.id === selectedId ? { ...asset, ...values } : asset))
    setLocalMedia(previous => previous.map(asset => asset.id === selectedId ? { ...asset, ...values } : asset))
  }

  function resetCrop() {
    updateSelected({ crop_x: 50, crop_y: 50, zoom: 1 })
  }

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!selected) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { x: event.clientX, y: event.clientY, cropX: Number(selected.crop_x ?? 50), cropY: Number(selected.crop_y ?? 50) }
  }

  function dragCrop(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const sensitivity = 0.35 / Number(selected?.zoom ?? 1)
    updateSelected({ crop_x: clamp(dragRef.current.cropX - (event.clientX - dragRef.current.x) * sensitivity, 0, 100), crop_y: clamp(dragRef.current.cropY - (event.clientY - dragRef.current.y) * sensitivity, 0, 100) })
  }

  function stopDrag() { dragRef.current = null }

  async function saveCrop() {
    if (!selected || selectedIsLocal) return
    setCropSaving(true)
    setError('')
    const response = await fetch(`/api/admin/content/media/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ crop_x: Number(selected.crop_x ?? 50), crop_y: Number(selected.crop_y ?? 50), zoom: Number(selected.zoom ?? 1) }) })
    const data = await response.json()
    if (!response.ok) setError(data.error || 'Não foi possível salvar o enquadramento.')
    else setSavedMessage('Enquadramento salvo.')
    setCropSaving(false)
  }

  async function removeExisting(assetId: string) {
    const response = await fetch(`/api/admin/content/media/${assetId}`, { method: 'DELETE' })
    if (!response.ok) return setError((await response.json()).error || 'Não foi possível remover a mídia.')
    const remaining = media.filter(asset => asset.id !== assetId)
    setMedia(remaining)
    if (selectedId === assetId) setSelectedId(remaining[0]?.id ?? localMedia[0]?.id ?? null)
  }

  function removeLocal(id: string) {
    const remaining = localMedia.filter(asset => asset.id !== id)
    setLocalMedia(remaining)
    if (selectedId === id) setSelectedId(media[0]?.id ?? remaining[0]?.id ?? null)
  }

  async function moveExisting(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= media.length || !postId) return
    const reordered = [...media]
    ;[reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]]
    setMedia(reordered)
    const response = await fetch(`/api/admin/content/posts/${postId}/media`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ asset_ids: reordered.map(asset => asset.id) }) })
    if (!response.ok) setError('A ordem não pôde ser salva. Atualize a página e tente novamente.')
  }

  async function save(event?: { preventDefault(): void }, forcedStatus?: PostStatus) {
    event?.preventDefault()
    setSaving(true)
    setError('')
    setSavedMessage('')
    try {
      const targetStatus = forcedStatus ?? form.status
      const payload = { client_id: clientId, calendar_id: form.calendar_id || null, title: form.title, scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null, format: form.format, aspect_ratio: form.aspect_ratio, caption: form.caption, hashtags: form.hashtags, internal_notes: form.internal_notes || null, status: targetStatus }
      const response = await fetch(postId ? `/api/admin/content/posts/${postId}` : '/api/admin/content/posts', { method: postId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar a publicação.')
      const savedPostId = postId ?? data.post.id

      if (localMedia.length) {
        const upload = new FormData()
        localMedia.forEach(asset => upload.append('files', asset.file))
        upload.append('settings', JSON.stringify(localMedia.map(asset => ({ crop_x: asset.crop_x, crop_y: asset.crop_y, zoom: asset.zoom }))))
        const uploadResponse = await fetch(`/api/admin/content/posts/${savedPostId}/media`, { method: 'POST', body: upload })
        const uploadData = await uploadResponse.json()
        if (!uploadResponse.ok) throw new Error(uploadData.error || 'A publicação foi salva, mas as mídias não foram enviadas.')
        setMedia(previous => [...previous, ...uploadData.media])
        setSelectedId(uploadData.media[0]?.id ?? selectedId)
        setLocalMedia([])
      }

      setForm(previous => ({ ...previous, status: targetStatus }))
      setSavedMessage(targetStatus === 'pending_review' ? 'Publicação enviada para aprovação.' : 'Alterações salvas.')
      if (!postId) { router.replace(`/admin/clientes/${clientId}/posts/${savedPostId}`); router.refresh() }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a publicação.')
    } finally { setSaving(false) }
  }

  async function deletePost() {
    if (!postId) return
    if (!confirmDelete) return setConfirmDelete(true)
    const response = await fetch(`/api/admin/content/posts/${postId}`, { method: 'DELETE' })
    if (response.ok) { router.push(`/admin/clientes/${clientId}`); router.refresh() }
    else { setError('Não foi possível excluir a publicação.'); setConfirmDelete(false) }
  }

  const previewMedia = useMemo(() => [...media, ...localMedia].map(asset => ({ id: asset.id, url: asset.url, mime_type: asset.mime_type, crop_x: asset.crop_x, crop_y: asset.crop_y, zoom: asset.zoom })), [localMedia, media])
  const previewPost = { ...form, scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null, media_assets: previewMedia }
  const canSubmitForReview = Boolean(form.title.trim() && previewMedia.length)

  if (loading) return <div className={styles.loading}><span className={styles.spin} /><br />Preparando o editor…</div>

  return (
    <div className={styles.hub}>
      <Link className={styles.backLink} href={`/admin/clientes/${clientId}`}>← Voltar para {client?.name ?? 'cliente'}</Link>
      <div className={styles.pageHeader}><div><div className={styles.eyebrow}>Mesa de criação</div><h1 className={styles.pageTitle}>{postId ? 'Editar publicação' : 'Nova publicação'}</h1><p className={styles.pageSubtitle}>Monte a peça e ajuste o enquadramento exatamente como aparecerá no Instagram.</p></div>{postId && <span className={`${styles.statusBadge} ${form.status === 'approved' ? styles.statusApproved : form.status === 'changes_requested' ? styles.statusChanges : form.status === 'pending_review' ? styles.statusPending : styles.statusDraft}`}>{POST_STATUS_LABELS[form.status]}</span>}</div>
      {error && <div className={styles.errorBox}>{error}</div>}{savedMessage && <div className={styles.successBox}>{savedMessage}</div>}

      <div className={styles.editorGrid}>
        <form className={styles.editorPanel} onSubmit={save}>
          <h2 className={styles.sectionHeading}>01 · Planejamento</h2>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="post-title">Título interno</label><input id="post-title" required value={form.title} onChange={event => setField('title', event.target.value)} placeholder="Ex.: Carrossel — 5 sinais de que sua marca precisa mudar" /></div>
            <div className={styles.field}><label htmlFor="post-calendar">Cronograma</label><select id="post-calendar" value={form.calendar_id} onChange={event => setField('calendar_id', event.target.value)}><option value="">Publicação avulsa</option>{client?.content_calendars?.map(calendar => <option value={calendar.id} key={calendar.id}>{calendar.name}</option>)}</select></div>
            <div className={styles.field}><label htmlFor="post-date">Data prevista</label><input id="post-date" type="datetime-local" value={form.scheduled_at} onChange={event => setField('scheduled_at', event.target.value)} /></div>
            <div className={styles.field}><label htmlFor="post-format">Formato</label><select id="post-format" value={form.format} onChange={event => setField('format', event.target.value as PostFormat)}><option value="image">Imagem única</option><option value="carousel">Carrossel</option><option value="video">Vídeo</option><option value="reel">Reel</option></select></div>
            <div className={styles.field}><label htmlFor="post-status">Etapa atual</label><select id="post-status" value={form.status} onChange={event => setField('status', event.target.value as PostStatus)}>{Object.entries(POST_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            <div className={`${styles.field} ${styles.fieldFull}`}><label>Proporção do post</label><div className={cropStyles.ratioPicker}><button className={`${cropStyles.ratioButton} ${form.aspect_ratio === '1:1' ? cropStyles.ratioButtonActive : ''}`} type="button" onClick={() => setField('aspect_ratio', '1:1')}><span className={cropStyles.squareIcon} />Quadrado 1:1</button><button className={`${cropStyles.ratioButton} ${form.aspect_ratio === '4:5' ? cropStyles.ratioButtonActive : ''}`} type="button" onClick={() => setField('aspect_ratio', '4:5')}><span className={cropStyles.portraitIcon} />Retrato 4:5</button></div><span className={styles.fieldHint}>No carrossel, todas as peças usam a mesma proporção, como no Instagram.</span></div>
          </div>

          <hr className={styles.sectionDivider} /><h2 className={styles.sectionHeading}>02 · Peças e enquadramento</h2>
          <label className={styles.uploadZone}><span className={styles.uploadTitle}>＋ Adicionar imagens ou vídeos</span><span className={styles.uploadHint}>JPG, PNG, WebP ou MP4 · até 50 MB por arquivo</span><input type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" onChange={event => addFiles(event.target.files)} /></label>

          {previewMedia.length > 0 && <div className={styles.mediaStrip}>
            {media.map((asset, index) => <div className={`${styles.mediaTile} ${selectedId === asset.id ? cropStyles.mediaTileSelected : ''}`} key={asset.id}><button className={cropStyles.mediaSelect} type="button" aria-label={`Ajustar mídia ${index + 1}`} onClick={() => setSelectedId(asset.id)} />{asset.mime_type.startsWith('video/') ? <video src={asset.url} style={cropStyle(asset)} /> :
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.url} style={cropStyle(asset)} alt={`Mídia ${index + 1}`} />}{index === 0 && <span className={styles.coverLabel}>Capa</span>}<div className={`${styles.mediaTileActions} ${cropStyles.mediaTileActionsAbove}`}>{index > 0 && <button className={styles.mediaIconButton} type="button" onClick={() => moveExisting(index, -1)}>←</button>}{index < media.length - 1 && <button className={styles.mediaIconButton} type="button" onClick={() => moveExisting(index, 1)}>→</button>}<button className={styles.mediaIconButton} type="button" onClick={() => removeExisting(asset.id)}>×</button></div></div>)}
            {localMedia.map((asset, index) => <div className={`${styles.mediaTile} ${selectedId === asset.id ? cropStyles.mediaTileSelected : ''}`} key={asset.id}><button className={cropStyles.mediaSelect} type="button" aria-label={`Ajustar nova mídia ${index + 1}`} onClick={() => setSelectedId(asset.id)} />{asset.mime_type.startsWith('video/') ? <video src={asset.url} style={cropStyle(asset)} /> :
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.url} style={cropStyle(asset)} alt={`Nova mídia ${index + 1}`} />}<span className={styles.coverLabel}>Nova</span><div className={`${styles.mediaTileActions} ${cropStyles.mediaTileActionsAbove}`}><button className={styles.mediaIconButton} type="button" onClick={() => removeLocal(asset.id)}>×</button></div></div>)}
          </div>}

          {selected && <div className={cropStyles.cropPanel}><div className={cropStyles.cropPanelHeader}><strong>Ajustar corte da peça</strong><span>Arraste a imagem dentro do quadro</span></div><div className={cropStyles.cropWorkspace}>
            <div className={cropStyles.cropFrame} style={{ aspectRatio: form.aspect_ratio === '4:5' ? '4 / 5' : '1 / 1' }} onPointerDown={startDrag} onPointerMove={dragCrop} onPointerUp={stopDrag} onPointerCancel={stopDrag}>
              {selected.mime_type.startsWith('video/') ? <video src={selected.url} style={cropStyle(selected)} /> :
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.url} style={cropStyle(selected)} alt="Área de enquadramento" />}<span className={cropStyles.cropGrid} />
            </div>
            <div className={cropStyles.cropFields}>
              <div className={cropStyles.sliderField}><label htmlFor="crop-zoom">Zoom <output>{Number(selected.zoom ?? 1).toFixed(2)}×</output></label><input id="crop-zoom" type="range" min="1" max="3" step="0.05" value={Number(selected.zoom ?? 1)} onChange={event => updateSelected({ zoom: Number(event.target.value) })} /></div>
              <div className={cropStyles.sliderField}><label htmlFor="crop-x">Horizontal <output>{Math.round(Number(selected.crop_x ?? 50))}%</output></label><input id="crop-x" type="range" min="0" max="100" value={Number(selected.crop_x ?? 50)} onChange={event => updateSelected({ crop_x: Number(event.target.value) })} /></div>
              <div className={cropStyles.sliderField}><label htmlFor="crop-y">Vertical <output>{Math.round(Number(selected.crop_y ?? 50))}%</output></label><input id="crop-y" type="range" min="0" max="100" value={Number(selected.crop_y ?? 50)} onChange={event => updateSelected({ crop_y: Number(event.target.value) })} /></div>
              <p className={cropStyles.cropHint}>{selectedIsLocal ? 'O enquadramento será salvo junto com o upload.' : 'Salve o enquadramento depois de posicionar esta peça.'}</p>
              <div style={{ display: 'flex', gap: 8 }}><button className={styles.quietButton} type="button" onClick={resetCrop}>Centralizar</button>{!selectedIsLocal && <button className={styles.primaryButton} disabled={cropSaving} type="button" onClick={saveCrop}>{cropSaving ? 'Salvando…' : 'Salvar corte'}</button>}</div>
            </div>
          </div></div>}

          <hr className={styles.sectionDivider} /><h2 className={styles.sectionHeading}>03 · Texto e orientação</h2>
          <div className={styles.formGrid}><div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="caption">Legenda</label><textarea id="caption" style={{ minHeight: 180 }} value={form.caption} onChange={event => setField('caption', event.target.value)} placeholder="Escreva a legenda que acompanhará a publicação…" /></div><div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="hashtags">Hashtags</label><textarea id="hashtags" value={form.hashtags} onChange={event => setField('hashtags', event.target.value)} placeholder="#majorhub #marketing" /></div><div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="internal-notes">Observações internas</label><textarea id="internal-notes" value={form.internal_notes} onChange={event => setField('internal_notes', event.target.value)} placeholder="O cliente não verá este campo." /></div></div>
          {reviews?.length ? <><hr className={styles.sectionDivider} /><h2 className={styles.sectionHeading}>Feedback mais recente</h2><div className={reviews[0].decision === 'approved' ? styles.successBox : styles.errorBox}><strong>{reviews[0].decision === 'approved' ? 'Aprovado' : 'Correção solicitada'}</strong>{reviews[0].reviewer_name && <> por {reviews[0].reviewer_name}</>}{reviews[0].comment && <div style={{ marginTop: 7, lineHeight: 1.6 }}>{reviews[0].comment}</div>}</div></> : null}
          <div className={styles.formActions} style={{ justifyContent: postId ? 'space-between' : 'flex-end', flexWrap: 'wrap' }}>{postId && <button className={styles.dangerButton} type="button" onClick={deletePost}>{confirmDelete ? 'Confirmar exclusão' : 'Excluir publicação'}</button>}<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className={styles.quietButton} disabled={saving} type="submit">{saving ? 'Salvando…' : 'Salvar alterações'}</button><button className={styles.primaryButton} disabled={saving || !canSubmitForReview} type="button" onClick={() => save(undefined, 'pending_review')}>{saving ? 'Enviando…' : form.status === 'changes_requested' || form.status === 'in_progress' ? 'Reenviar para aprovação' : 'Enviar para aprovação'}</button></div></div>
        </form>

        <aside className={styles.editorPreview}><div className={styles.proofLabel}><strong>Preview do cliente · {form.aspect_ratio}</strong><span>Arraste o carrossel</span></div><PostPreview post={previewPost} client={{ name: client?.name ?? 'Cliente', instagram: client?.instagram, avatar_url: client?.avatar_url }} /></aside>
      </div>
    </div>
  )
}
