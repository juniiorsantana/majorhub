import type { Orcamento } from '@/content/orcamentos'

type Tamanho = 'sm' | 'md'

interface Props {
  marca: Orcamento['marca']
  tamanho?: Tamanho
  /** Em faixas escuras, inverte o texto para o tom de contraste. */
  invertido?: boolean
}

const dimensoes: Record<Tamanho, { box: string; letra: string; nome: string }> = {
  sm: { box: 'h-11 w-11', letra: 'text-xl', nome: 'text-sm' },
  md: { box: 'h-14 w-14', letra: 'text-2xl', nome: 'text-base' },
}

export function Monograma({ marca, tamanho = 'sm', invertido = false }: Props) {
  const d = dimensoes[tamanho]
  const corNome = invertido ? 'text-[var(--orc-contrast-text)]' : 'text-[var(--orc-text)]'
  const corLinha = invertido ? 'bg-[var(--orc-contrast-soft)]' : 'bg-[var(--orc-line)]'

  return (
    <div className="flex items-center gap-4">
      <span
        aria-hidden="true"
        className={`orc-display flex items-center justify-center text-[var(--orc-accent)] ${d.box} ${d.letra}`}
      >
        {marca.monograma}
      </span>

      <span aria-hidden="true" className={`h-9 w-px ${corLinha}`} />

      <span className="flex flex-col leading-tight">
        <span
          className={`font-semibold uppercase tracking-[0.18em] ${d.nome} ${corNome}`}
        >
          {marca.nome}
        </span>
        {marca.assinatura && (
          <span className="orc-label mt-1 text-[var(--orc-accent)]">{marca.assinatura}</span>
        )}
      </span>
    </div>
  )
}
