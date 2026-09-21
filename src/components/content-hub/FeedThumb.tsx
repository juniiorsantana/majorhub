import type { CSSProperties } from 'react'
import styles from './PortalFeed.module.css'
import { ASPECT_RATIO_CSS, type PostAspectRatio } from '@/lib/content-hub/types'
import { coverAsset, isVideo, mediaStyle, type FramedMedia } from '@/lib/content-hub/media'

/**
 * Miniatura da grade do perfil: a peça no próprio formato, com o enquadramento
 * do editor, recortada ao centro em 3:4 como o Instagram faz.
 */
export default function FeedThumb({ media, aspectRatio }: { media: FramedMedia[]; aspectRatio: PostAspectRatio }) {
  const asset = coverAsset(media)
  if (!asset?.url) return <span className={styles.thumbEmpty} aria-hidden="true" />

  const frame = { '--thumb-ratio': ASPECT_RATIO_CSS[aspectRatio] } as CSSProperties
  return (
    <span className={styles.thumb} data-tall={aspectRatio === '9:16' || undefined} style={frame} aria-hidden="true">
      {isVideo(asset)
        ? <video src={`${asset.url}#t=0.1`} style={mediaStyle(asset)} muted playsInline preload="metadata" />
        // eslint-disable-next-line @next/next/no-img-element
        : <img src={asset.url} style={mediaStyle(asset)} alt="" loading="lazy" decoding="async" />}
    </span>
  )
}
