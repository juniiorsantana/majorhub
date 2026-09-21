import type { CSSProperties } from 'react'

export interface FramedMedia {
  url?: string
  mime_type?: string
  crop_x?: number
  crop_y?: number
  zoom?: number
  is_cover?: boolean
}

/** O mesmo enquadramento definido no editor: posição do recorte e zoom. */
export function mediaStyle(asset: FramedMedia): CSSProperties {
  return {
    objectPosition: `${Number(asset.crop_x ?? 50)}% ${Number(asset.crop_y ?? 50)}%`,
    transform: `scale(${Number(asset.zoom ?? 1)})`,
  }
}

export function isVideo(asset: FramedMedia) {
  return Boolean(asset.mime_type?.startsWith('video/'))
}

export function coverAsset<T extends FramedMedia>(media: T[]): T | undefined {
  return media.find(asset => asset.is_cover) ?? media[0]
}
