import type { PostAspectRatio, PostFormat, PostStatus } from '@/lib/content-hub/types'

export type ReviewDecision = 'approved' | 'changes_requested'

export interface PortalMedia {
  id: string
  url?: string
  mime_type: string
  crop_x?: number
  crop_y?: number
  zoom?: number
  is_cover?: boolean
}

export interface PortalReview {
  decision: ReviewDecision
  comment: string | null
  reviewer_name: string | null
  created_at: string
}

export interface PortalPost {
  id: string
  title: string
  creative_code?: string | null
  scheduled_at: string | null
  format: PostFormat
  aspect_ratio: PostAspectRatio
  caption: string
  hashtags: string
  status: PostStatus
  current_version: number
  version_at_publish: number
  media: PortalMedia[]
  latest_review: PortalReview | null
}

export interface PortalBatch {
  id: string
  title: string
  slug: string
  status: 'draft' | 'open' | 'closed' | 'archived'
  published_at: string | null
  posts: PortalPost[]
}

export interface PortalClient {
  id: string
  name: string
  contact_name: string | null
  instagram: string | null
  avatar_url: string | null
}

export interface PortalFeed {
  client: PortalClient
  batches: PortalBatch[]
}
