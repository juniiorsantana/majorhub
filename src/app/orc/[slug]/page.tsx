import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getOrcamento,
  getOrcamentoSlugs,
  getTemaClassName,
  getTemaStyle,
  getValidadeFormatada,
} from '@/content/orcamentos'
import { OrcamentoHero } from '@/components/orcamento/OrcamentoHero'
import { Parceria } from '@/components/orcamento/Parceria'
import { FaixaImagem } from '@/components/orcamento/FaixaImagem'
import { Investimento } from '@/components/orcamento/Investimento'
import { EscopoDetalhado } from '@/components/orcamento/EscopoDetalhado'
import { Cronograma } from '@/components/orcamento/Cronograma'
import { TermosProposta } from '@/components/orcamento/TermosProposta'
import { FaqOrcamento } from '@/components/orcamento/FaqOrcamento'
import { CtaAceite } from '@/components/orcamento/CtaAceite'

export function generateStaticParams() {
  return getOrcamentoSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const orcamento = getOrcamento(slug)

  if (!orcamento) {
    return { title: 'Proposta não encontrada | MajorHub', robots: { index: false, follow: false } }
  }

  return {
    title: `${orcamento.proposta.titulo} — ${orcamento.cliente.nome} | MajorHub`,
    description: orcamento.proposta.subtitulo,
    // Proposta comercial: link direto, fora do índice dos buscadores.
    robots: { index: false, follow: false, nocache: true },
  }
}

export default async function OrcamentoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const orcamento = getOrcamento(slug)

  if (!orcamento) notFound()

  const validade = getValidadeFormatada(orcamento)

  return (
    <main
      className={`orc-root relative pb-20 md:pb-0 ${getTemaClassName(orcamento.tema)}`}
      style={getTemaStyle(orcamento.tema)}
    >
      <OrcamentoHero orcamento={orcamento} validade={validade} />
      <Parceria orcamento={orcamento} />
      <FaixaImagem orcamento={orcamento} />
      <Investimento orcamento={orcamento} />
      <EscopoDetalhado orcamento={orcamento} />
      <Cronograma orcamento={orcamento} />
      <TermosProposta orcamento={orcamento} validade={validade} />
      <FaqOrcamento orcamento={orcamento} />
      <CtaAceite orcamento={orcamento} validade={validade} />

      {/* Barra fixa de aceite — só no mobile, onde os planos ficam longe do polegar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--orc-line)] bg-[var(--orc-bg)] px-4 py-3 md:hidden">
        <a
          href="#investimento"
          className="flex w-full items-center justify-center gap-3 bg-[var(--orc-accent)] px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--orc-contrast-bg)]"
        >
          Ver investimento
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </main>
  )
}
