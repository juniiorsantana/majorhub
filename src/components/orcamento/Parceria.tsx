import { RevealWrapper } from '@/components/ui/RevealWrapper'
import type { Orcamento } from '@/content/orcamentos'

/** Faixa de contraste que apresenta a entrega conjunta e o papel de cada agência. */
export function Parceria({ orcamento }: { orcamento: Orcamento }) {
  const { parceria } = orcamento
  if (!parceria) return null

  return (
    <section
      id="parceria"
      className="relative bg-[var(--orc-contrast-bg)] text-[var(--orc-contrast-text)]"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <RevealWrapper>
          <div className="flex items-center gap-4">
            <span className="orc-label text-[var(--orc-accent)]">Uma entrega em collab</span>
            <span aria-hidden="true" className="h-px flex-1 bg-[var(--orc-contrast-soft)] opacity-30" />
          </div>
        </RevealWrapper>

        <RevealWrapper delay={0.08}>
          <p className="orc-display mt-8 text-[clamp(34px,5vw,60px)] leading-[1.05]">
            MajorHub <span className="italic text-[var(--orc-accent)]">×</span> {parceria.nome}
          </p>
        </RevealWrapper>

        <RevealWrapper delay={0.14}>
          <p className="mt-6 max-w-2xl leading-relaxed text-[var(--orc-contrast-soft)]">
            {parceria.descricao}
          </p>
        </RevealWrapper>

        <div className="mt-16 grid border-t border-[var(--orc-contrast-soft)]/30 md:grid-cols-2 md:divide-x md:divide-[var(--orc-contrast-soft)]/30">
          {parceria.frentes.map((frente, i) => (
            <RevealWrapper key={frente.agencia} delay={0.1 + i * 0.08} className="h-full">
              <div className={`h-full py-10 ${i === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                <p className="orc-label text-[var(--orc-accent)]">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="orc-display mt-4 text-[30px]">{frente.agencia}</h3>
                <p className="mt-2 text-sm text-[var(--orc-contrast-soft)]">{frente.papel}</p>

                <ul className="mt-7 divide-y divide-[var(--orc-contrast-soft)]/20 border-t border-[var(--orc-contrast-soft)]/20">
                  {frente.itens.map(item => (
                    <li
                      key={item}
                      className="flex items-center justify-between gap-5 py-3.5 text-sm leading-relaxed"
                    >
                      <span>{item}</span>
                      <span aria-hidden="true" className="h-px w-4 shrink-0 bg-[var(--orc-accent)]" />
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
