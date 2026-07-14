import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/ui/Navbar'
import { BlogFooter } from '@/components/blog/BlogFooter'
import { RevealWrapper } from '@/components/ui/RevealWrapper'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog — MajorHub',
  description: 'Análises, tendências e conteúdo prático sobre automação, IA, WhatsApp, marketing de performance e vendas para empresas que querem crescer no digital.',
  openGraph: {
    title: 'Blog — MajorHub',
    description: 'Análises, tendências e conteúdo prático sobre automação, IA, WhatsApp, marketing de performance e vendas.',
    url: 'https://majorhub.com.br/blog',
    type: 'website',
  },
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  return (
    <main className="min-h-screen bg-[#f6f9fc] text-[#0a2540]">
      <Navbar />

      <section className="relative pt-32 md:pt-40 pb-20 px-6">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(0,153,255,0.10), transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center mb-16">
          <RevealWrapper>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0099ff] bg-[#0099ff]/8 border border-[#0099ff]/20 rounded-full px-4 py-2 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0099ff] animate-pulse" />
              Blog MajorHub
            </p>
          </RevealWrapper>

          <RevealWrapper delay={0.1}>
            <h1 className="font-sora font-extrabold text-[clamp(32px,5.5vw,52px)] leading-[1.12] mb-6">
              Ideias que movem{' '}
              <span className="bg-gradient-to-r from-[#0099ff] to-[#667eea] bg-clip-text text-transparent">
                negócios de verdade
              </span>
            </h1>
          </RevealWrapper>

          <RevealWrapper delay={0.2}>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
              Automação, inteligência artificial, WhatsApp, marketing de performance e vendas — análises práticas para quem opera de verdade.
            </p>
          </RevealWrapper>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          {posts.length === 0 && (
            <p className="text-slate-500 text-center">Nenhum artigo publicado ainda.</p>
          )}

          <div className="flex flex-col gap-6">
            {posts.map((post, i) => (
              <RevealWrapper key={post.slug} delay={0.1 + i * 0.05}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block rounded-2xl border border-slate-200 bg-white hover:border-[#0099ff]/40 hover:shadow-[0_16px_40px_-16px_rgba(0,153,255,0.25)] transition-all p-6 md:p-8"
                >
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">
                    <span className="px-3 py-1 rounded-full bg-[#0099ff]/8 text-[#0099ff]">
                      {post.category}
                    </span>
                    <span>{formatDate(post.date)}</span>
                    <span>&middot;</span>
                    <span>{post.readingTime} min de leitura</span>
                  </div>

                  <h2 className="font-sora font-bold text-2xl md:text-3xl leading-tight text-[#0a2540] mb-3 group-hover:text-[#0099ff] transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-slate-600 leading-relaxed mb-4">
                    {post.description}
                  </p>

                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0099ff]">
                    Ler artigo completo
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </section>

      <BlogFooter />
    </main>
  )
}
