'use client'
import { copy } from '@/content/copy'

import { BrilhoButton } from '@/components/ui/BrilhoButton'
import { WHATSAPP_URL } from '@/lib/analytics'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { RevealWrapper } from '@/components/ui/RevealWrapper'

export function CtaFinal() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">

      
      <div className="relative z-10 max-w-4xl mx-auto text-center glassmorphism p-12 md:p-20 overflow-hidden">
        {/* Glow de Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,229,255,0.1)] to-[rgba(102,126,234,0.1)] opacity-50 pointer-events-none" />
        
        <SectionTitle type="chars" className="font-sora font-extrabold text-[clamp(32px,5vw,56px)] text-text-primary mb-6 relative z-10">
          {copy.cta.titulo}
        </SectionTitle>
        
        <RevealWrapper delay={0.2} direction="up" className="relative z-10">
          <p className="text-text-secondary text-lg mb-12">
            {copy.cta.texto}
          </p>
        </RevealWrapper>

        <RevealWrapper delay={0.4} direction="up" className="relative z-10 flex flex-col items-center">
          <BrilhoButton
            href={WHATSAPP_URL}
            label={copy.cta.cta as string}
            target="_blank"
          />
          <p className="mt-6 text-sm text-text-meta">{copy.cta.apoio}</p>
        </RevealWrapper>
      </div>
    </section>
  )
}
