import type { Metadata } from 'next'
import './hmt.css'

export const metadata: Metadata = {
  title: 'Proposta de site | HiperbaricaMT',
  description:
    'Proposta de desenvolvimento de site para a HiperbaricaMT, com estrutura preparada para busca e mecanismos de IA.',
  robots: { index: false, follow: false, nocache: true },
}

export default function HmtLayout({ children }: { children: React.ReactNode }) {
  return children
}
