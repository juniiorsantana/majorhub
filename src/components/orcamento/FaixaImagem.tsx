import Image from 'next/image'
import { RevealWrapper } from '@/components/ui/RevealWrapper'
import type { Orcamento } from '@/content/orcamentos'

/** Imagem larga entre o cabeçalho e o investimento, ex.: o empreendimento em destaque. */
export function FaixaImagem({ orcamento }: { orcamento: Orcamento }) {
  const { faixaImagem } = orcamento
  if (!faixaImagem) return null

  return (
    <section className="mx-auto max-w-7xl px-6 pt-20 md:px-12">
      <RevealWrapper>
        <figure>
          <div className="relative aspect-[16/9] overflow-hidden bg-[var(--orc-contrast-bg)]">
            <Image
              src={faixaImagem.imagem}
              alt={faixaImagem.imagemAlt}
              fill
              sizes="(max-width: 1280px) 100vw, 1184px"
              className="object-cover"
            />
          </div>
          {faixaImagem.legenda && (
            <figcaption className="mt-4 flex items-center gap-4 text-sm text-[var(--orc-text-soft)]">
              <span aria-hidden="true" className="h-px w-10 bg-[var(--orc-accent)]" />
              {faixaImagem.legenda}
            </figcaption>
          )}
        </figure>
      </RevealWrapper>
    </section>
  )
}
