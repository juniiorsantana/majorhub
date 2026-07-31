import Image from 'next/image'
import { RevealWrapper } from '@/components/ui/RevealWrapper'
import { Monograma } from './Monograma'
import { CheckIcon } from './CheckIcon'
import type { Orcamento } from '@/content/orcamentos'

interface Props {
  orcamento: Orcamento
  validade: string
}

function formatarEmissao(iso: string) {
  const data = new Date(`${iso}T00:00:00`)
  return {
    dia: data.toLocaleDateString('pt-BR', { day: '2-digit' }),
    mes: data.toLocaleDateString('pt-BR', { month: 'long' }),
    ano: String(data.getFullYear()),
  }
}

export function OrcamentoHero({ orcamento, validade }: Props) {
  const { marca, cliente, proposta, hero, alinhamentos } = orcamento
  const emissao = formatarEmissao(proposta.emitidaEm)

  return (
    <header className="relative">
      {/* Barra da marca */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6 py-8 md:px-12">
        <Monograma marca={marca} />

        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="hidden h-px w-12 bg-[var(--orc-accent)] sm:block" />
          <span className="orc-label text-[var(--orc-text-soft)]">Proposta comercial</span>
        </div>
      </div>

      {/* Hero: texto + visual em corte diagonal */}
      <div className="relative grid items-stretch lg:grid-cols-[1fr_0.95fr]">
        <div className="px-6 pt-10 pb-16 md:px-12 lg:py-24 lg:pr-16">
          <div className="mx-auto max-w-xl lg:ml-auto lg:mr-0">
            <RevealWrapper>
              <h1 className="orc-display text-[clamp(40px,6.5vw,70px)] text-[var(--orc-text)]">
                {proposta.titulo}
                {proposta.tituloDestaque && (
                  <span className="mt-1 block italic text-[var(--orc-accent)]">
                    {proposta.tituloDestaque}
                  </span>
                )}
              </h1>
            </RevealWrapper>

            <RevealWrapper delay={0.08}>
              <span className="orc-rule mt-8" />
            </RevealWrapper>

            <RevealWrapper delay={0.14}>
              <p className="mt-8 max-w-md text-[17px] leading-relaxed text-[var(--orc-text-soft)]">
                {proposta.subtitulo}
              </p>
            </RevealWrapper>

            <RevealWrapper delay={0.22}>
              <div className="mt-12 border-l-2 border-[var(--orc-accent)] pl-5">
                <p className="orc-label text-[var(--orc-text-soft)]">Proposta para</p>
                <p className="orc-display mt-2 text-[26px] text-[var(--orc-text)]">
                  {cliente.tratamento ? `${cliente.tratamento} ` : ''}
                  {cliente.nome}
                </p>
                <p className="mt-1.5 text-sm text-[var(--orc-text-soft)]">{cliente.segmento}</p>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={0.3}>
              <a
                href="#investimento"
                className="mt-12 inline-flex items-center gap-3 border border-[var(--orc-text)] px-9 py-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--orc-text)] transition-colors duration-300 hover:bg-[var(--orc-text)] hover:text-[var(--orc-bg)]"
              >
                Ver investimento
                <span aria-hidden="true">→</span>
              </a>
            </RevealWrapper>
          </div>
        </div>

        {/* Visual */}
        {/* orc-hero-cut já traz o media query do corte diagonal — não prefixar com lg: */}
        <div className="orc-hero-cut relative min-h-[280px] overflow-hidden bg-[var(--orc-contrast-bg)] lg:min-h-[620px]">
          {hero?.imagem ? (
            <Image
              src={hero.imagem}
              alt={hero.imagemAlt || `Identidade visual — ${marca.nome}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            /* Sem imagem definida: painel tipográfico com o monograma em escala */
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                aria-hidden="true"
                className="orc-display select-none text-[clamp(140px,20vw,260px)] leading-none text-[var(--orc-accent)] opacity-25"
              >
                {marca.monograma}
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-6 border border-[var(--orc-contrast-soft)] opacity-25 lg:inset-12"
              />
            </div>
          )}

          {/* Tarja da data */}
          <div className="absolute bottom-0 right-0 flex flex-col items-center gap-1 bg-[var(--orc-accent)] px-6 py-6 text-[var(--orc-contrast-bg)]">
            <span className="text-lg font-semibold leading-none">{emissao.dia}</span>
            <span className="orc-label leading-none">{emissao.mes}</span>
            <span className="text-sm leading-none">{emissao.ano}</span>
          </div>
        </div>
      </div>

      {/* Objetivo + o que ficou alinhado */}
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <div className="grid gap-x-16 gap-y-12 border-t border-[var(--orc-line)] pt-16 md:grid-cols-[0.8fr_1.2fr]">
          <RevealWrapper>
            <p className="orc-label text-[var(--orc-text-soft)]">O objetivo</p>
            <p className="orc-display mt-5 text-[24px] leading-snug text-[var(--orc-text)]">
              {cliente.contexto}
            </p>
          </RevealWrapper>

          <RevealWrapper delay={0.1}>
            <p className="orc-label text-[var(--orc-text-soft)]">
              O que ficou alinhado na nossa conversa
            </p>
            <ul className="mt-5 divide-y divide-[var(--orc-line)] border-y border-[var(--orc-line)]">
              {alinhamentos.map(item => (
                <li key={item} className="flex gap-4 py-4 text-[var(--orc-text)]">
                  <CheckIcon className="text-[var(--orc-accent)]" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-[var(--orc-text-soft)]">
              Proposta válida até <span className="text-[var(--orc-text)]">{validade}</span>.
            </p>
          </RevealWrapper>
        </div>
      </div>
    </header>
  )
}
