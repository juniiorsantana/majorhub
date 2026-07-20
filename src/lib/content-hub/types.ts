export type ClientStatus = 'active' | 'archived'
export type CalendarStatus = 'draft' | 'active' | 'completed' | 'archived'
export type PostStatus = 'draft' | 'pending_review' | 'changes_requested' | 'in_progress' | 'approved' | 'published' | 'archived'
export type PostFormat = 'image' | 'carousel' | 'video' | 'reel'
export type PostAspectRatio = '1:1' | '4:5'

export interface MediaAsset {
  id: string
  storage_path: string
  mime_type: string
  position: number
  is_cover: boolean
  crop_x?: number
  crop_y?: number
  zoom?: number
  url?: string
}

export interface Review {
  id?: string
  decision: 'approved' | 'changes_requested'
  comment: string | null
  reviewer_name: string | null
  created_at: string
  version?: number
}

export interface ContentPost {
  id: string
  client_id: string
  calendar_id: string | null
  title: string
  scheduled_at: string | null
  format: PostFormat
  aspect_ratio: PostAspectRatio
  caption: string
  hashtags: string
  internal_notes?: string | null
  status: PostStatus
  current_version: number
  created_at?: string
  updated_at?: string
  media_assets: MediaAsset[]
  reviews?: Review[]
  latest_review?: Review | null
}

export interface ContentCalendar {
  id: string
  client_id: string
  name: string
  starts_on: string | null
  ends_on: string | null
  status: CalendarStatus
  created_at?: string
  posts: ContentPost[]
}

export interface ContentClient {
  id: string
  name: string
  contact_name: string | null
  email: string
  instagram: string | null
  phone: string | null
  avatar_path: string | null
  avatar_url?: string | null
  internal_notes: string | null
  status: ClientStatus
  created_at: string
  updated_at: string
  content_calendars?: ContentCalendar[]
  posts?: ContentPost[]
  stats?: { total: number; pending: number; changes: number; approved: number }
}

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: 'Rascunho',
  pending_review: 'Aguardando aprovação',
  changes_requested: 'Correção solicitada',
  in_progress: 'Em correção',
  approved: 'Aprovado',
  published: 'Publicado',
  archived: 'Arquivado',
}

export const CALENDAR_STATUS_LABELS: Record<CalendarStatus, string> = {
  draft: 'Em montagem',
  active: 'Em aprovação',
  completed: 'Concluído',
  archived: 'Arquivado',
}
