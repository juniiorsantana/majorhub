'use client'

import styles from './ContentHub.module.css'
import MediaCarousel from './MediaCarousel'
import type { PostAspectRatio } from '@/lib/content-hub/types'

interface PreviewMedia { id?: string; url?: string; mime_type?: string; crop_x?: number; crop_y?: number; zoom?: number }
interface PreviewPost { id?: string; caption?: string; hashtags?: string; scheduled_at?: string | null; aspect_ratio?: PostAspectRatio; media_assets?: PreviewMedia[]; media?: PreviewMedia[] }
interface PreviewClient { name: string; instagram?: string | null; avatar_url?: string | null }

function initials(name: string) { return name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() }

/** Ícones decorativos da barra de ações do post; não fazem nada, só completam a simulação. */
export function InstagramActions({ className = styles.igActions }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" stroke="currentColor" strokeWidth="1.8" /></svg>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="m22 2-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
    </div>
  )
}

export default function PostPreview({ post, client }: { post: PreviewPost; client: PreviewClient }) {
  const media = post.media_assets ?? post.media ?? []
  const handle = client.instagram?.replace(/^@/, '') || client.name.toLowerCase().replace(/\s+/g, '')
  const location = post.scheduled_at ? `Previsto para ${new Date(post.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}` : 'Conteúdo em aprovação'

  return (
    <article className={styles.instagramCard} aria-label="Pré-visualização da publicação">
      <header className={styles.igHeader}>
        {client.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.igAvatar} src={client.avatar_url} alt="" />
        ) : <span className={styles.igAvatar}>{initials(client.name)}</span>}
        <div className={styles.igIdentity}>{handle}<small>{location}</small></div><span className={styles.igDots} aria-hidden="true">•••</span>
      </header>

      <MediaCarousel media={media} aspectRatio={post.aspect_ratio} />

      <InstagramActions />
      <div className={styles.igCaption}><strong>{handle}</strong>{post.caption || 'A legenda aparecerá aqui.'}{post.hashtags && <><br /><span className={styles.hashtags}>{post.hashtags}</span></>}</div>
    </article>
  )
}
