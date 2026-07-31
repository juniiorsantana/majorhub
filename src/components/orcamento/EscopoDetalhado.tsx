import { RevealWrapper } from '@/components/ui/RevealWrapper'
import type { Orcamento } from '@/content/orcamentos'

export function EscopoDetalhado({ orcamento }: { orcamento: Orcamento }) {
  return (
    <section id="escopo" className="relative py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <RevealWrapper>
          <div className="flex items-center gap-4">
            <span className="orc-label text-[var(--orc-text-soft)]">O que está incluso</span>
            <span aria-hidden="true" className="h-px flex-1 bg-[var(--orc-line)]" />
          </div>
        </RevealWrapper>

        <RevealWrapper delay={0.08}>
          <p className="orc-display mt-8 max-w-2xl text-[clamp(26px,3.4vw,38px)] text-[var(--orc-text)]">
            O detalhamento{' '}
            <span className="italic text-[var(--orc-accent)]">por frente de trabalho.</span>
          </p>
        </RevealWrapper>

        <RevealWrapper delay={0.14}>
          <p className="mt-5 max-w-xl leading-relaxed text-[var(--orc-text-soft)]">
            A disponibilidade de cada frente depende do plano escolhido.
          </p>
        </RevealWrapper>

        <div className="mt-16 grid gap-x-14 gap-y-14 md:grid-cols-2">
          {orcamento.escopo.map((bloco, i) => (
            <RevealWrapper key={bloco.titulo} delay={0.1 + i * 0.08} className="h-full">
              <div className="h-full">
                <p className="orc-label text-[var(--orc-accent)]">
                  {String(i + 1).padStart(2, '0')}
                </p>

                <h3 className="orc-display mt-4 text-[24px] text-[var(--orc-text)]">
                  {bloco.titulo}
                </h3>

                <ul className="mt-7 divide-y divide-[var(--orc-line)] border-t border-[var(--orc-line)]">
                  {bloco.itens.map(item => (
                    <li
                      key={item}
                      className="flex items-center justify-between gap-5 py-3.5 text-sm leading-relaxed text-[var(--orc-text)]"
                    >
                      <span>{item}</span>
                      <span
                        aria-hidden="true"
                        className="h-px w-4 shrink-0 bg-[var(--orc-accent)]"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  )
}
