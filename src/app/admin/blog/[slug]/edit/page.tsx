import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlug } from '@/lib/blog'
import PostEditor from '@/components/blog/PostEditor'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Editar: ${slug} — Admin MajorHub`,
    robots: { index: false, follow: false },
  }
}

export default async function EditPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) notFound()

  return (
    <PostEditor
      mode="edit"
      originalSlug={slug}
      initialData={{
        title: post.title,
        seo_title: post.seo_title,
        description: post.description,
        slug: post.slug,
        author: post.author,
        date: post.date,
        lastmod: post.lastmod,
        category: post.category,
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags,
        draft: post.draft,
        content: post.content,
      }}
    />
  )
}
