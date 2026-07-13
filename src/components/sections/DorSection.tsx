'use client'
import { copy } from '@/content/copy'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { RevealWrapper } from '@/components/ui/RevealWrapper'

export function DorSection() {
  return (
    <section className="relative py-24 px-6 bg-[#f8fafc] border-y border-[#e2e8f0] overflow-hidden">
      {/* Fundo Glow Sutil — suavizado para tema light */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-[rgba(8,145,178,0.03)] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Lado Esquerdo - Título e Texto */}
        <div className="space-y-8 pr-0 lg:pr-8">
          <SectionTitle type="words" className="font-sora font-extrabold text-[clamp(32px,4vw,48px)] text-[#0f172a] leading-tight">
            {copy.dor.titulo}
          </SectionTitle>
          <RevealWrapper delay={0.2} direction="up">
            <p className="text-[#475569] text-lg leading-relaxed max-w-xl">
              {copy.dor.texto}
            </p>
          </RevealWrapper>
        </div>

        {/* Lado Direito - Lista de Dores */}
        <div className="space-y-4 relative">
          {/* Fio conector abstrato atrás dos cards */}
          <div className="absolute left-10 top-10 bottom-10 w-[1px] bg-gradient-to-b from-transparent via-[rgba(8,145,178,0.2)] to-transparent hidden sm:block pointer-events-none" />

          {copy.dor.items.map((item, i) => (
            <RevealWrapper key={i} delay={i * 0.1} direction="left" className="relative group">
              <div className="relative p-6 rounded-xl border border-[#e2e8f0] group-hover:border-[rgba(8,145,178,0.35)] group-hover:-translate-y-1 transition-all duration-300 md:ml-0 flex gap-5 items-start bg-[#ffffff] shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
                {/* Glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(8,145,178,0.04)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                
                <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(8,145,178,0.10)] border border-[rgba(8,145,178,0.2)] flex items-center justify-center group-hover:bg-[rgba(8,145,178,0.15)] group-hover:shadow-[0_0_12px_rgba(8,145,178,0.25)] transition-all duration-300">
                  <span className="text-[#0891b2] text-sm leading-none font-bold mt-[1px]">✕</span>
                </div>
                <p className="relative text-[#1e293b] font-medium leading-relaxed pt-1">{item}</p>
              </div>
            </RevealWrapper>
          ))}
        </div>

      </div>
    </section>
  )
}
