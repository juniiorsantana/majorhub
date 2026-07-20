import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { authorizeAdmin } from '@/lib/admin/auth'
import { postSchema, routeSlugSchema } from '@/lib/admin/post-schema'

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog')

function findFileBySlug(slug: string): string | null {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))
  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
    const { data } = matter(raw)
    if (data.slug === slug) return file
  }
  return null
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

// GET — retorna post específico com conteúdo
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  }
  const parsedSlug = routeSlugSchema.safeParse((await params).slug)
  if (!parsedSlug.success) return NextResponse.json({ error: 'Slug inválido.' }, { status: 400 })
  const slug = parsedSlug.data
  const file = findFileBySlug(slug)
  if (!file) return NextResponse.json({ error: 'Post não encontrado.' }, { status: 404 })

  const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
  const { data, content } = matter(raw)
  return NextResponse.json({ ...data, content: content.trim(), filename: file })
}

// PUT — atualiza post existente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authorization = await authorizeAdmin()
    if (!authorization.authorized) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
    }
    const parsedSlug = routeSlugSchema.safeParse((await params).slug)
    if (!parsedSlug.success) return NextResponse.json({ error: 'Slug inválido.' }, { status: 400 })
    const slug = parsedSlug.data
    const file = findFileBySlug(slug)
    if (!file) return NextResponse.json({ error: 'Post não encontrado.' }, { status: 404 })

    const parsed = postSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Dados do post inválidos.' }, { status: 400 })
    const { content, ...meta } = parsed.data

    // Se mudou o slug, renomeia o arquivo
    const newFilename = `${meta.slug || slug}.md`
    const oldPath = path.join(BLOG_DIR, file)
    const newPath = path.join(BLOG_DIR, newFilename)

    const frontmatter = buildFrontmatter({ ...meta, slug: meta.slug || slug })
    const fullContent = `${frontmatter}\n\n${content}`

    if (oldPath !== newPath) {
      fs.unlinkSync(oldPath)
    }
    fs.writeFileSync(newPath, fullContent, 'utf-8')

    return NextResponse.json({ ok: true, slug: meta.slug || slug, filename: newFilename })
  } catch (err) {
    console.error('[admin/blog PUT]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

// DELETE — remove post
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authorization = await authorizeAdmin()
    if (!authorization.authorized) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
    }
    const parsedSlug = routeSlugSchema.safeParse((await params).slug)
    if (!parsedSlug.success) return NextResponse.json({ error: 'Slug inválido.' }, { status: 400 })
    const slug = parsedSlug.data
    const file = findFileBySlug(slug)
    if (!file) return NextResponse.json({ error: 'Post não encontrado.' }, { status: 404 })

    fs.unlinkSync(path.join(BLOG_DIR, file))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/blog DELETE]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
