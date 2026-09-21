'use client'

import { useRef, useState } from 'react'
import styles from './ContentHub.module.css'
import { ASPECT_RATIO_CSS, type PostAspectRatio } from '@/lib/content-hub/types'
import { isVideo, mediaStyle, type FramedMedia } from '@/lib/content-hub/media'

interface CarouselMedia extends FramedMedia { id?: string }

interface MediaCarouselProps {
  media: CarouselMedia[]
  aspectRatio?: PostAspectRatio
  emptyLabel?: string
  onSlideChange?: (index: number) => void
}

export default function MediaCarousel({ media, aspectRatio = '1:1', emptyLabel = 'Adicione uma imagem para visualizar', onSlideChange }: MediaCarouselProps) {
  const [slide, setSlide] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const activeSlide = Math.min(slide, Math.max(0, media.length - 1))
  const ratio = ASPECT_RATIO_CSS[aspectRatio]

  function showSlide(index: number) {
    if (index === activeSlide) return
    setSlide(index)
    onSlideChange?.(index)
  }

  function goTo(index: number) {
    const next = Math.max(0, Math.min(index, Math.max(0, media.length - 1)))
    showSlide(next)
    const width = carouselRef.current?.clientWidth ?? 0
    carouselRef.current?.scrollTo({ left: width * next, behavior: 'smooth' })
  }

  function onScroll() {
    const element = carouselRef.current
    if (element?.clientWidth) showSlide(Math.round(element.scrollLeft / element.clientWidth))
  }

  return (
    <div className={styles.carouselWrap}>
      <div className={styles.carousel} ref={carouselRef} onScroll={onScroll}>
        {media.length ? media.map((asset, index) => <div className={styles.slide} style={{ aspectRatio: ratio }} key={asset.id ?? `${asset.url}-${index}`}>
          {isVideo(asset) ? <video src={asset.url} style={mediaStyle(asset)} controls playsInline /> :
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset.url} style={mediaStyle(asset)} alt={`Peça ${index + 1} da publicação`} />}
        </div>) : <div className={styles.slide} style={{ aspectRatio: ratio }}><div className={styles.placeholderArt}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" /><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="m4 17 4.5-4.5 3 3 2-2L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>{emptyLabel}</div></div>}
      </div>
      {media.length > 1 && <>
        {activeSlide > 0 && <button type="button" className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`} onClick={() => goTo(activeSlide - 1)} aria-label="Imagem anterior">‹</button>}
        {activeSlide < media.length - 1 && <button type="button" className={`${styles.carouselArrow} ${styles.carouselArrowRight}`} onClick={() => goTo(activeSlide + 1)} aria-label="Próxima imagem">›</button>}
        <span className={styles.carouselCount}>{activeSlide + 1}/{media.length}</span>
        <div className={styles.carouselDots} aria-hidden="true">{media.map((_, index) => <span key={index} className={`${styles.carouselDot} ${index === activeSlide ? styles.carouselDotActive : ''}`} />)}</div>
      </>}
    </div>
  )
}
