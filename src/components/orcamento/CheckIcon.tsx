/**
 * Marcador editorial dos itens de lista: um filete curto no lugar do ícone de check.
 * Mantém o alinhamento com a primeira linha do texto.
 */
export function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-[0.62em] block h-px w-3.5 shrink-0 bg-current ${className}`}
    />
  )
}
