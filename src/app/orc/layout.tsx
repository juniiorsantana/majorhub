import { Cormorant_Garamond } from 'next/font/google'
import './orcamento.css'

/**
 * Serifada de display das propostas. Fica neste layout (e não no raiz)
 * para que o resto do site não pague o download.
 */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-orc-display',
  display: 'swap',
})

export default function OrcLayout({ children }: { children: React.ReactNode }) {
  return <div className={cormorant.variable}>{children}</div>
}
