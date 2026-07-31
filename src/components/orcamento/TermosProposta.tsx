import { RevealWrapper } from '@/components/ui/RevealWrapper'
import type { Orcamento } from '@/content/orcamentos'

interface Props {
  orcamento: Orcamento
  validade: string
}

export function TermosProposta({ orcamento, validade }: Props) {
  const { termos, proposta } = orcamento

  const blocos = [
    { titulo: 'Forma de pagamento', itens: termos.pagamento },
    { titulo: 'Vigência', itens: termos.vigencia },
    { titulo: 'Não incluso', itens: termos.naoIncluso },
  ]

  return (
    <section id="termos" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <RevealWrapper>
          <div className="flex items-center gap-4">
            <span className="orc-label text-[var(--orc-text-soft)]">Condições</span>
            <span aria-hidden="true" className="h-px flex-1 bg-[var(--orc-line)]" />
          </div>
        </RevealWrapper>

        <RevealWrapper delay={0.08}>
          <p className="orc-display mt-8 max-w-2xl text-[clamp(26px,3.4vw,38px)] text-[var(--orc-text)]">
            Tudo por escrito,{' '}
            <span className="italic text-[var(--orc-accent)]">sem letra miúda.</span>
          </p>
        </RevealWrapper>

        <div className="mt-16 grid gap-x-14 gap-y-12 md:grid-cols-3">
          {blocos.map((bloco, i) => (
            <RevealWrapper key={bloco.titulo} delay={0.1 + i * 0.08} className="h-full">
              <div className="h-full">
                <h3 className="orc-label text-[var(--orc-accent)]">{bloco.titulo}</h3>

                <ul className="mt-6 divide-y divide-[var(--orc-line)] border-t border-[var(--orc-line)]">
                  {bloco.itens.map(item => (
                    <li
                      key={item}
                      className="py-3.5 text-sm leading-relaxed text-[var(--orc-text)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealWrapper>
          ))}
        </div>

        <RevealWrapper delay={0.3}>
          <p className="mt-14 border-l-2 border-[var(--orc-accent)] py-2 pl-5 text-sm text-[var(--orc-text-soft)]">
            Esta proposta é válida por{' '}
            <span className="text-[var(--orc-text)]">{proposta.validadeDias} dias corridos</span>,
            até <span className="text-[var(--orc-text)]">{validade}</span>.
          </p>
        </RevealWrapper>
      </div>
    </section>
  )
}
