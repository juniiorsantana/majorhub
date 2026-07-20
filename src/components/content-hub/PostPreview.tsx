'use client'

import { CSSProperties, useRef, useState } from 'react'
import styles from './ContentHub.module.css'

interface PreviewMedia { id?: string; url?: string; mime_type?: string; crop_x?: number; crop_y?: number; zoom?: number }
interface PreviewPost { caption?: string; hashtags?: string; scheduled_at?: string | null; aspect_ratio?: '1:1' | '4:5'; media_assets?: PreviewMedia[]; media?: PreviewMedia[] }
interface PreviewClient { name: string; instagram?: string | null; avatar_url?: string | null }

function initials(name: string) { return name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() }
function mediaStyle(asset: PreviewMedia): CSSProperties { return { objectPosition: `${Number(asset.crop_x ?? 50)}% ${Number(asset.crop_y ?? 50)}%`, transform: `scale(${Number(asset.zoom ?? 1)})` } }

export default function PostPreview({ post, client }: { post: PreviewPost; client: PreviewClient }) {
  const media = post.media_assets ?? post.media ?? []
  const [slide, setSlide] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const activeSlide = Math.min(slide, Math.max(0, media.length - 1))
  const aspectRatio = post.aspect_ratio === '4:5' ? '4 / 5' : '1 / 1'

  function goTo(index: number) {
    const next = Math.max(0, Math.min(index, Math.max(0, media.length - 1)))
    setSlide(next)
    const width = carouselRef.current?.clientWidth ?? 0
    carouselRef.current?.scrollTo({ left: width * next, behavior: 'smooth' })
  }

  function onScroll() {
    const element = carouselRef.current
    if (element?.clientWidth) setSlide(Math.round(element.scrollLeft / element.clientWidth))
  }

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

      <div className={styles.carouselWrap}>
        <div className={styles.carousel} ref={carouselRef} onScroll={onScroll}>
          {media.length ? media.map((asset, index) => <div className={styles.slide} style={{ aspectRatio }} key={asset.id ?? `${asset.url}-${index}`}>
            {asset.mime_type?.startsWith('video/') ? <video src={asset.url} style={mediaStyle(asset)} controls playsInline /> :
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.url} style={mediaStyle(asset)} alt={`Peça ${index + 1} da publicação`} />}
          </div>) : <div className={styles.slide} style={{ aspectRatio }}><div className={styles.placeholderArt}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" /><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="m4 17 4.5-4.5 3 3 2-2L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>Adicione uma imagem para visualizar</div></div>}
        </div>
        {media.length > 1 && <>
          {activeSlide > 0 && <button type="button" className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`} onClick={() => goTo(activeSlide - 1)} aria-label="Imagem anterior">‹</button>}
          {activeSlide < media.length - 1 && <button type="button" className={`${styles.carouselArrow} ${styles.carouselArrowRight}`} onClick={() => goTo(activeSlide + 1)} aria-label="Próxima imagem">›</button>}
          <span className={styles.carouselCount}>{activeSlide + 1}/{media.length}</span>
          <div className={styles.carouselDots} aria-hidden="true">{media.map((_, index) => <span key={index} className={`${styles.carouselDot} ${index === activeSlide ? styles.carouselDotActive : ''}`} />)}</div>
        </>}
      </div>

      <div className={styles.igActions} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" stroke="currentColor" strokeWidth="1.8" /></svg>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="m22 2-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
      </div>
      <div className={styles.igCaption}><strong>{handle}</strong>{post.caption || 'A legenda aparecerá aqui.'}{post.hashtags && <><br /><span className={styles.hashtags}>{post.hashtags}</span></>}</div>
    </article>
  )
}
