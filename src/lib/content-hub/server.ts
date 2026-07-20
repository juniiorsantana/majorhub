import type { SupabaseClient } from '@supabase/supabase-js'
import type { MediaAsset } from './types'

export async function withSignedMediaUrls(
  supabase: SupabaseClient,
  media: MediaAsset[] | null | undefined,
  expiresIn = 60 * 60
) {
  if (!media?.length) return []

  return Promise.all(media.map(async asset => {
    const { data } = await supabase.storage.from('client-media').createSignedUrl(asset.storage_path, expiresIn)
    return { ...asset, url: data?.signedUrl }
  }))
}

export function normalizeInstagram(value?: string | null) {
  return value?.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/^@/, '').replace(/\/$/, '') || null
}
