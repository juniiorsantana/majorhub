import { z } from 'zod'

const optionalText = z.string().trim().max(2000).optional().nullable()

export const clientSchema = z.object({
  name: z.string().trim().min(2).max(120),
  contact_name: z.string().trim().max(120).optional().nullable(),
  email: z.string().trim().email().max(180),
  instagram: z.string().trim().max(120).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  internal_notes: optionalText,
  status: z.enum(['active', 'archived']).default('active'),
})

export const calendarSchema = z.object({
  name: z.string().trim().min(2).max(120),
  starts_on: z.string().date().optional().nullable(),
  ends_on: z.string().date().optional().nullable(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft'),
})

export const postSchema = z.object({
  client_id: z.string().uuid(),
  calendar_id: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(2).max(160),
  scheduled_at: z.string().datetime({ offset: true }).optional().nullable(),
  format: z.enum(['image', 'carousel', 'video', 'reel']).default('image'),
  aspect_ratio: z.enum(['1:1', '4:5']).default('1:1'),
  caption: z.string().max(10000).default(''),
  hashtags: z.string().max(3000).default(''),
  internal_notes: z.string().max(5000).optional().nullable(),
  status: z.enum(['draft', 'pending_review', 'changes_requested', 'in_progress', 'approved', 'published', 'archived']).default('draft'),
})

export const mediaCropSchema = z.object({
  crop_x: z.number().min(0).max(100),
  crop_y: z.number().min(0).max(100),
  zoom: z.number().min(1).max(3),
})

export const shareLinkSchema = z.object({
  calendar_id: z.string().uuid().optional().nullable(),
  expires_in_days: z.number().int().min(1).max(365).optional().default(30),
})

export const reviewSchema = z.object({
  post_id: z.string().uuid(),
  decision: z.enum(['approved', 'changes_requested']),
  comment: z.string().trim().max(3000).optional().nullable(),
  reviewer_name: z.string().trim().max(120).optional().nullable(),
}).superRefine((value, context) => {
  if (value.decision === 'changes_requested' && !value.comment) {
    context.addIssue({ code: 'custom', path: ['comment'], message: 'Descreva o que precisa ser corrigido.' })
  }
})
