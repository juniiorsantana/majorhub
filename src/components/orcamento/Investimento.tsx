import { RevealWrapper } from '@/components/ui/RevealWrapper'
import { CheckIcon } from './CheckIcon'
import { getDestinoAceite, type Orcamento, type PlanoOrcamento } from '@/content/orcamentos'

function BotaoAceite({
  href,
  destaque,
  emFita,
}: {
  href: string
  destaque: boolean
  /** Dentro da fita o botão não tem borda própria — quem desenha é o container. */
  emFita: boolean
}) {
  const preenchimento = destaque
    ? 'bg-[var(--orc-accent)] text-[var(--orc-contrast-bg)] hover:bg-transparent hover:text-[var(--orc-text)]'
    : emFita
      ? 'text-[var(--orc-text)] hover:bg-[var(--orc-accent-soft)]'
      : 'border border-[var(--orc-line)] text-[var(--orc-text)] hover:border-[var(--orc-accent)] hover:text-[var(--orc-accent)]'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex w-full items-center justify-center gap-3 px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${preenchimento}`}
    >
      Aceitar e contratar
      <span aria-hidden="true">→</span>
    </a>
  )
}

/** Fita da condição comercial encostada no topo do botão, formando uma peça só. */
function FitaCondicao({ condicao }: { condicao: NonNullable<PlanoOrcamento['condicao']> }) {
  return (
    <p className="flex flex-wrap items-baseline justify-center gap-x-2.5 gap-y-1 border-b border-[var(--orc-accent)] bg-[var(--orc-accent-soft)] px-4 py-3 text-center">
      <span className="orc-label text-[var(--orc-accent)]">{condicao.rotulo ?? 'Condição'}</span>
      <span aria-hidden="true" className="text-[var(--orc-accent)] opacity-40">
        ·
      </span>
      <span className="orc-display text-[19px] leading-none text-[var(--orc-text)]">
        {condicao.valor}
      </span>
      <span className="text-xs text-[var(--orc-text-soft)]">{condicao.periodo ?? '/mês'}</span>
    </p>
  )
}

function Aceite({ orcamento, plano }: { orcamento: Orcamento; plano: PlanoOrcamento }) {
  const href = getDestinoAceite(orcamento, plano)
  const destaque = Boolean(plano.destaque)

  return plano.condicao ? (
    <div className="border border-[var(--orc-accent)]">
      <FitaCondicao condicao={plano.condicao} />
      <BotaoAceite href={href} destaque={destaque} emFita />
    </div>
  ) : (
    <BotaoAceite href={href} destaque={destaque} emFita={false} />
  )
}

/** Plano único: sem comparação, o card ganha a largura toda. */
function PlanoUnico({ orcamento, plano }: { orcamento: Orcamento; plano: PlanoOrcamento }) {
  return (
    <div className="mt-16 grid gap-x-16 gap-y-12 border-y border-[var(--orc-line)] py-12 lg:grid-cols-[0.85fr_1.15fr]">
      <RevealWrapper delay={0.1}>
        <article className="flex h-full flex-col">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-6 bg-[var(--orc-accent)]" />
            <span className="orc-label text-[var(--orc-accent)]">O plano</span>
          </div>

          <h3 className="orc-display mt-6 text-[clamp(30px,3.6vw,40px)] leading-tight text-[var(--orc-text)]">
            {plano.nome}
          </h3>

          <p className="mt-4 max-w-md leading-relaxed text-[var(--orc-text-soft)]">{plano.resumo}</p>

          <div className="mt-10">
            <p className="flex items-baseline gap-1.5">
              <span className="orc-display text-[clamp(42px,5vw,58px)] text-[var(--orc-text)]">
                {plano.valor}
              </span>
              <span className="text-sm text-[var(--orc-text-soft)]">{plano.periodo}</span>
            </p>
            {plano.observacao && (
              <p className="mt-2 text-xs text-[var(--orc-text-soft)]">{plano.observacao}</p>
            )}
          </div>

          <div className="mt-10 lg:mt-auto lg:pt-10">
            <Aceite orcamento={orcamento} plano={plano} />
          </div>
        </article>
      </RevealWrapper>

      <RevealWrapper delay={0.18}>
        <div>
          <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {plano.inclui.map(item => (
              <li key={item} className="flex gap-4 text-sm leading-relaxed text-[var(--orc-text)]">
                <CheckIcon className="text-[var(--orc-accent)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </RevealWrapper>
    </div>
  )
}

export function Investimento({ orcamento }: { orcamento: Orcamento }) {
  const unico = orcamento.planos.length === 1

  return (
    <section id="investimento" className="relative py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <RevealWrapper>
          <div className="flex items-center gap-4">
            <span className="orc-label text-[var(--orc-text-soft)]">Investimento</span>
            <span aria-hidden="true" className="h-px flex-1 bg-[var(--orc-line)]" />
          </div>
        </RevealWrapper>

        <RevealWrapper delay={0.08}>
          <p className="orc-display mt-8 max-w-2xl text-[clamp(26px,3.4vw,38px)] text-[var(--orc-text)]">
            {unico ? (
              <>
                Um plano completo,{' '}
                <span className="italic text-[var(--orc-accent)]">do jeito que o seu momento pede.</span>
              </>
            ) : (
              <>
                Três formatos possíveis,{' '}
                <span className="italic text-[var(--orc-accent)]">um mesmo cuidado.</span>
              </>
            )}
          </p>
        </RevealWrapper>

        <RevealWrapper delay={0.14}>
          <p className="mt-5 max-w-xl leading-relaxed text-[var(--orc-text-soft)]">
            {unico
              ? 'Investimento mensal, com entregas definidas e acompanhamento de perto desde o primeiro mês.'
              : 'Todos os planos são mensais e podem evoluir a qualquer momento — começar menor não significa começar devagar.'}
          </p>
        </RevealWrapper>

        {unico ? (
          <PlanoUnico orcamento={orcamento} plano={orcamento.planos[0]} />
        ) : (
        /* Colunas separadas por filete: lado a lado no desktop, empilhadas no mobile */
        <div
          className={`mt-16 grid divide-y divide-[var(--orc-line)] border-y border-[var(--orc-line)] lg:divide-x lg:divide-y-0 ${
            orcamento.planos.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
          }`}
        >
          {orcamento.planos.map((plano, i) => (
            <RevealWrapper key={plano.id} delay={0.1 + i * 0.08} className="h-full">
              <article
                className={`flex h-full flex-col px-0 py-10 lg:px-9 ${
                  i === 0 ? 'lg:pl-0' : ''
                } ${i === orcamento.planos.length - 1 ? 'lg:pr-0' : ''}`}
              >
                <div className="flex min-h-[22px] items-center gap-3">
                  {plano.destaque ? (
                    <>
                      <span aria-hidden="true" className="h-px w-6 bg-[var(--orc-accent)]" />
                      <span className="orc-label text-[var(--orc-accent)]">Recomendado</span>
                    </>
                  ) : (
                    <span className="orc-label text-[var(--orc-text-soft)]">
                      Plano {String(i + 1).padStart(2, '0')}
                    </span>
                  )}
                </div>

                <h3 className="orc-display mt-6 text-[26px] leading-tight text-[var(--orc-text)]">
                  {plano.nome}
                </h3>

                <p className="mt-4 min-h-[66px] text-sm leading-relaxed text-[var(--orc-text-soft)]">
                  {plano.resumo}
                </p>

                <div className="mt-8">
                  <p className="flex items-baseline gap-1.5">
                    <span className="orc-display text-[clamp(38px,4.5vw,50px)] text-[var(--orc-text)]">
                      {plano.valor}
                    </span>
                    <span className="text-sm text-[var(--orc-text-soft)]">{plano.periodo}</span>
                  </p>
                  {plano.observacao && (
                    <p className="mt-2 text-xs text-[var(--orc-text-soft)]">{plano.observacao}</p>
                  )}
                </div>

                {plano.herdaDe && (
                  <p className="mt-8 border-l-2 border-[var(--orc-accent)] py-1 pl-4 text-sm italic text-[var(--orc-text)]">
                    Inclui o plano {plano.herdaDe}, mais:
                  </p>
                )}

                <ul className="mt-8 flex-1 space-y-4">
                  {plano.inclui.map(item => (
                    <li
                      key={item}
                      className="flex gap-4 text-sm leading-relaxed text-[var(--orc-text)]"
                    >
                      <CheckIcon className="text-[var(--orc-accent)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  <Aceite orcamento={orcamento} plano={plano} />
                </div>
              </article>
            </RevealWrapper>
          ))}
        </div>
        )}

        <RevealWrapper delay={0.3}>
          <p className="mt-8 text-sm text-[var(--orc-text-soft)]">
            {unico ? 'Ficou alguma dúvida?' : 'Em dúvida sobre qual escolher?'}{' '}
            <a
              href={`https://wa.me/${orcamento.contato.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--orc-text)] underline decoration-[var(--orc-accent)] underline-offset-4 transition-colors hover:text-[var(--orc-accent)]"
            >
              me chame no WhatsApp
            </a>
            .
          </p>
        </RevealWrapper>
      </div>
    </section>
  )
}
