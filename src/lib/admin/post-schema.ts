import { z } from 'zod'

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido.')

const singleLine = (max: number) =>
  z.string().trim().min(1).max(max).regex(/^[^\r\n]*$/, 'Quebras de linha não são permitidas.')

export const postSchema = z.object({
  title: singleLine(160),
  seo_title: singleLine(160).optional(),
  description: singleLine(320),
  slug: slugSchema,
  author: singleLine(100).optional().default('MAJOR'),
  date: z.iso.date(),
  lastmod: z.iso.date().optional(),
  category: singleLine(80),
  tags: z.array(singleLine(60)).max(20).default([]),
  draft: z.boolean().default(false),
  content: z.string().min(1).max(500_000),
}).strict()

export const routeSlugSchema = slugSchema
