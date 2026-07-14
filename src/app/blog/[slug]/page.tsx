import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { BlogFooter } from '@/components/blog/BlogFooter'
import { RevealWrapper } from '@/components/ui/RevealWrapper'
import { MarkdownContent } from '@/components/blog/MarkdownContent'
import { extractFaq, getAllSlugs, getPostBySlug } from '@/lib/blog'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  const url = `https://majorhub.com.br/blog/${post.slug}`

  return {
    title: `${post.seo_title ?? post.title} | Blog MajorHub`,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      title: post.seo_title ?? post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.lastmod ?? post.date,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title ?? post.title,
      description: post.description,
    },
  }
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author: { '@type': 'Organization', name: post.author },
    datePublished: post.date,
    dateModified: post.lastmod ?? post.date,
    publisher: { '@type': 'Organization', name: 'MajorHub' },
    mainEntityOfPage: `https://majorhub.com.br/blog/${post.slug}`,
  }

  const faqItems = extractFaq(post.content)
  const faqJsonLd = faqItems.length > 0 && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <main className="min-h-screen bg-[#f6f9fc] text-[#0a2540]">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <article className="relative pt-32 md:pt-40 pb-24 px-6">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,153,255,0.10), transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <RevealWrapper>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0099ff] transition-colors mb-8"
            >
              ← Voltar para o blog
            </Link>
          </RevealWrapper>

          <RevealWrapper delay={0.05}>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 mb-6">
              <span className="px-3 py-1 rounded-full bg-[#0099ff]/8 text-[#0099ff]">
                {post.category}
              </span>
              <span>{formatDate(post.date)}</span>
              <span>&middot;</span>
              <span>{post.readingTime} min de leitura</span>
              <span>&middot;</span>
              <span>{post.author}</span>
            </div>
          </RevealWrapper>

          <RevealWrapper delay={0.1}>
            <h1 className="font-sora font-extrabold text-[clamp(30px,5vw,48px)] leading-[1.15] mb-6 text-[#0a2540]">
              {post.title}
            </h1>
          </RevealWrapper>

          <RevealWrapper delay={0.15}>
            <p className="text-slate-600 text-lg leading-relaxed mb-12 pb-10 border-b border-slate-200">
              {post.description}
            </p>
          </RevealWrapper>

          <RevealWrapper delay={0.2}>
            <MarkdownContent content={post.content} />
          </RevealWrapper>

          <RevealWrapper delay={0.1}>
            <div className="mt-12 pt-10 border-t border-slate-200 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </RevealWrapper>

          <RevealWrapper delay={0.15}>
            <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_16px_40px_-20px_rgba(0,153,255,0.25)]">
              <h2 className="font-sora font-bold text-xl md:text-2xl text-[#0a2540] mb-3">
                Sua empresa está preparada para essa mudança?
              </h2>
              <p className="text-slate-600 mb-6 max-w-xl mx-auto">
                A MajorHub estrutura operações de atendimento, automação e vendas para empresas que querem crescer com eficiência e segurança.
              </p>
              <a
                href="https://wa.me/5565992178164"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#0099ff] to-[#667eea] hover:brightness-110 hover:shadow-[0_12px_32px_-8px_rgba(0,153,255,0.55)] transition-all"
              >
                Falar com a MajorHub →
              </a>
            </div>
          </RevealWrapper>
        </div>
      </article>

      <BlogFooter />
    </main>
  )
}
