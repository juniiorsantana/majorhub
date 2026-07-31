import { RevealWrapper } from '@/components/ui/RevealWrapper'
import type { Orcamento } from '@/content/orcamentos'

export function Cronograma({ orcamento }: { orcamento: Orcamento }) {
  const etapas = orcamento.cronograma

  return (
    <section
      id="cronograma"
      className="relative mt-8 bg-[var(--orc-contrast-bg)] py-24 text-[var(--orc-contrast-text)]"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <RevealWrapper>
            <div className="flex items-center gap-4">
              <span className="orc-label text-[var(--orc-contrast-soft)]">Processo</span>
              <span aria-hidden="true" className="h-px w-12 bg-[var(--orc-accent)]" />
            </div>

            <p className="orc-display mt-7 text-[clamp(28px,3.6vw,40px)] text-[var(--orc-contrast-text)]">
              Em {etapas.length} etapas
              <span className="mt-1 block italic text-[var(--orc-accent)]">
                do onboarding à rotina.
              </span>
            </p>

            <p className="mt-6 max-w-sm leading-relaxed text-[var(--orc-contrast-soft)]">
              O primeiro mês tem um plano de execução claro — você sabe exatamente o que acontece em
              cada semana.
            </p>
          </RevealWrapper>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {etapas.map((etapa, i) => (
              <RevealWrapper key={etapa.periodo} delay={0.08 + i * 0.08}>
                <div className="relative">
                  <p className="orc-display text-[32px] leading-none text-[var(--orc-contrast-text)]">
                    {String(i + 1).padStart(2, '0')}
                  </p>

                  {/* Trilho da timeline: ponto + linha até a próxima etapa */}
                  <div className="relative mt-6 mb-6 flex items-center">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--orc-accent)]"
                    />
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-[var(--orc-contrast-soft)] opacity-40"
                    />
                  </div>

                  <h3 className="orc-label text-[var(--orc-contrast-text)]">{etapa.periodo}</h3>

                  <ul className="mt-4 space-y-2">
                    {etapa.itens.map(item => (
                      <li
                        key={item}
                        className="text-sm leading-relaxed text-[var(--orc-contrast-soft)]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
