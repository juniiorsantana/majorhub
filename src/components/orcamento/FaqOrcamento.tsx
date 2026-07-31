import { RevealWrapper } from '@/components/ui/RevealWrapper'
import type { Orcamento } from '@/content/orcamentos'

export function FaqOrcamento({ orcamento }: { orcamento: Orcamento }) {
  return (
    <section id="faq" className="relative pb-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.6fr_1.4fr] lg:gap-16">
          <RevealWrapper>
            <div className="flex items-center gap-4">
              <span className="orc-label text-[var(--orc-text-soft)]">Dúvidas</span>
              <span aria-hidden="true" className="h-px w-12 bg-[var(--orc-accent)]" />
            </div>

            <p className="orc-display mt-7 text-[clamp(26px,3.2vw,36px)] text-[var(--orc-text)]">
              Perguntas
              <span className="mt-1 block italic text-[var(--orc-accent)]">frequentes.</span>
            </p>
          </RevealWrapper>

          <div className="divide-y divide-[var(--orc-line)] border-y border-[var(--orc-line)]">
            {orcamento.faq.map((item, i) => (
              <RevealWrapper key={item.pergunta} delay={0.05 + i * 0.04}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                    <span className="orc-display text-[19px] leading-snug text-[var(--orc-text)]">
                      {item.pergunta}
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-lg leading-none text-[var(--orc-accent)] transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-6 text-sm leading-relaxed text-[var(--orc-text-soft)]">
                    {item.resposta}
                  </p>
                </details>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
