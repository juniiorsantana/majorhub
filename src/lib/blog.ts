import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog')

export interface PostMeta {
  title: string
  seo_title?: string
  description: string
  slug: string
  author: string
  date: string
  lastmod?: string
  category: string
  tags: string[]
  draft?: boolean
}

export interface Post extends PostMeta {
  content: string
  readingTime: number
}

function readPostFile(filename: string): Post {
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
  const { data, content } = matter(raw)
  const words = content.trim().split(/\s+/).length
  const readingTime = Math.max(1, Math.round(words / 200))

  return {
    title: data.title,
    seo_title: data.seo_title,
    description: data.description,
    slug: data.slug,
    author: data.author,
    date: data.date,
    lastmod: data.lastmod,
    category: data.category,
    tags: data.tags ?? [],
    draft: data.draft ?? false,
    content,
    readingTime,
  }
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))
  const posts = files.map(readPostFile).filter(post => !post.draft)

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPostBySlug(slug: string): Post | null {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))

  for (const file of files) {
    const post = readPostFile(file)
    if (post.slug === slug) return post
  }

  return null
}

export function getAllSlugs(): string[] {
  return getAllPosts().map(post => post.slug)
}

export interface FaqItem {
  question: string
  answer: string
}

// Extrai os pares pergunta/resposta da seção "## Perguntas frequentes"
// do markdown, para gerar o schema FAQPage do post.
export function extractFaq(content: string): FaqItem[] {
  const section = content
    .split(/^## /m)
    .find(s => s.toLowerCase().startsWith('perguntas frequentes'))
  if (!section) return []

  const items: FaqItem[] = []
  const blocks = section.split(/^### /m).slice(1)

  for (const block of blocks) {
    const [question, ...rest] = block.split('\n')
    const answer = rest
      .join(' ')
      .replace(/\*\*/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()
    if (question.trim() && answer) {
      items.push({ question: question.trim(), answer })
    }
  }

  return items
}
