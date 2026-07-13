import type { Metadata } from 'next'
import { DiagnosticoApp } from '@/components/diagnostico/DiagnosticoApp'
import { AiChatMockup } from '@/components/diagnostico/AiChatMockup'
import { RevealWrapper } from '@/components/ui/RevealWrapper'
import { diagnosticoCopy } from '@/content/diagnostico-copy'

export const metadata: Metadata = {
  title: 'Sua empresa aparece quando a IA responde? — Diagnóstico Grátis | MajorHub',
  description: diagnosticoCopy.hero.subtitulo,
}

export default function DiagnosticoPage() {
  return (
    <main className="min-h-screen bg-[#f6f9fc] text-[#0a2540] overflow-hidden">
      {/* ─── Seção 1: Hero ─── */}
      <section className="relative pt-20 md:pt-28 pb-20 px-6">
        {/* Glow sutil de fundo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(0,153,255,0.10), transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <RevealWrapper>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0099ff] bg-[#0099ff]/8 border border-[#0099ff]/20 rounded-full px-4 py-2 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0099ff] animate-pulse" />
              {diagnosticoCopy.hero.badge}
            </p>
          </RevealWrapper>

          <RevealWrapper delay={0.1}>
            <h1 className="font-sora font-extrabold text-[clamp(32px,5.5vw,58px)] leading-[1.12] mb-6">
              {diagnosticoCopy.hero.titulo[0]}{' '}
              <span className="bg-gradient-to-r from-[#0099ff] to-[#667eea] bg-clip-text text-transparent">
                {diagnosticoCopy.hero.titulo[1]}
              </span>
            </h1>
          </RevealWrapper>

          <RevealWrapper delay={0.2}>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              {diagnosticoCopy.hero.subtitulo}
            </p>
          </RevealWrapper>

          <RevealWrapper delay={0.3}>
            <a
              href="#diagnostico"
              className="inline-block px-8 py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#0099ff] to-[#667eea] hover:brightness-110 hover:shadow-[0_12px_32px_-8px_rgba(0,153,255,0.55)] transition-all"
            >
              {diagnosticoCopy.hero.cta} →
            </a>
          </RevealWrapper>
        </div>

        {/* Mockup: a IA recomendando o concorrente */}
        <div className="relative z-10 mt-16">
          <AiChatMockup />
        </div>
      </section>

      {/* ─── Seção 2: Onde seus clientes pesquisam ─── */}
      <section className="relative py-20 px-6 bg-white border-y border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <RevealWrapper>
            <h2 className="font-sora font-extrabold text-[clamp(26px,4vw,40px)] leading-[1.15] mb-5">
              {diagnosticoCopy.plataformas.titulo}
            </h2>
          </RevealWrapper>

          <RevealWrapper delay={0.1}>
            <p className="text-slate-600 text-lg leading-relaxed mb-10">
              {diagnosticoCopy.plataformas.texto}
            </p>
          </RevealWrapper>

          <RevealWrapper delay={0.2}>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {diagnosticoCopy.plataformas.lista.map(nome => (
                <span
                  key={nome}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f6f9fc] border border-slate-200 text-sm font-semibold text-[#0a2540]"
                >
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#0099ff] to-[#667eea]" />
                  {nome}
                </span>
              ))}
            </div>
          </RevealWrapper>

          <RevealWrapper delay={0.3}>
            <p className="font-sora font-bold text-xl text-[#0a2540]">
              {diagnosticoCopy.plataformas.fechamento}
            </p>
          </RevealWrapper>
        </div>
      </section>

      {/* ─── Seção 3: Diagnóstico ─── */}
      <section id="diagnostico" className="relative py-24 px-6">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(102,126,234,0.08), transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center mb-12">
          <RevealWrapper>
            <h2 className="font-sora font-extrabold text-[clamp(26px,4vw,40px)] leading-[1.15] mb-5">
              {diagnosticoCopy.ferramenta.tituloSecao}
            </h2>
          </RevealWrapper>
          <RevealWrapper delay={0.1}>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
              {diagnosticoCopy.ferramenta.subtituloSecao}
            </p>
          </RevealWrapper>
        </div>

        <div className="relative z-10">
          <DiagnosticoApp />
        </div>

        <p className="relative z-10 text-center text-xs text-slate-400 mt-16">
          MAJOR<span className="font-bold">HUB</span> — Diagnóstico Digital
        </p>
      </section>
    </main>
  )
}
