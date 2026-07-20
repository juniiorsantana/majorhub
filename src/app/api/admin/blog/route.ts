import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { authorizeAdmin } from '@/lib/admin/auth'
import { postSchema } from '@/lib/admin/post-schema'

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog')

function ensureBlogDir() {
  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true })
}

function buildFrontmatter(data: Record<string, unknown>): string {
  const tags = Array.isArray(data.tags)
    ? data.tags.map((t: unknown) => `  - ${t}`).join('\n')
    : ''

  return `---
title: "${String(data.title).replace(/"/g, '\\"')}"
seo_title: "${String(data.seo_title || data.title).replace(/"/g, '\\"')}"
description: "${String(data.description).replace(/"/g, '\\"')}"
slug: "${data.slug}"
author: "${data.author || 'MAJOR'}"
date: "${data.date}"
lastmod: "${data.lastmod || data.date}"
category: "${data.category}"
tags:
${tags}
draft: ${data.draft ? 'true' : 'false'}
---`
}

// GET — lista todos os posts (incluindo drafts)
export async function GET() {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  }

  ensureBlogDir()
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))

  const posts = files.map(file => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
    const { data, content } = matter(raw)
    const words = content.trim().split(/\s+/).length
    return {
      filename: file,
      title: data.title,
      slug: data.slug,
      description: data.description,
      date: data.date,
      lastmod: data.lastmod,
      category: data.category,
      tags: data.tags ?? [],
      draft: data.draft ?? false,
      author: data.author,
      readingTime: Math.max(1, Math.round(words / 200)),
      wordCount: words,
    }
  })

  posts.sort((a, b) => (a.date < b.date ? 1 : -1))
  return NextResponse.json(posts)
}

// POST — cria novo post
export async function POST(request: NextRequest) {
  try {
    const authorization = await authorizeAdmin()
    if (!authorization.authorized) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
    }

    ensureBlogDir()
    const parsed = postSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Dados do post inválidos.' }, { status: 400 })
    const { slug, content, ...meta } = parsed.data

    // Verifica se já existe
    const filename = `${slug}.md`
    const filepath = path.join(BLOG_DIR, filename)
    if (fs.existsSync(filepath)) {
      return NextResponse.json({ error: 'Já existe um post com esse slug.' }, { status: 409 })
    }

    const frontmatter = buildFrontmatter({ ...meta, slug })
    const fullContent = `${frontmatter}\n\n${content}`
    fs.writeFileSync(filepath, fullContent, { encoding: 'utf-8', flag: 'wx' })

    return NextResponse.json({ ok: true, slug, filename })
  } catch (err) {
    console.error('[admin/blog POST]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
