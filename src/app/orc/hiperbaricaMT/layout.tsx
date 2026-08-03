import type { Metadata } from 'next'
import './hmt.css'

const title = 'Proposta de desenvolvimento | HiperbaricaMT'
const description =
  'Proposta da MajorHub para o desenvolvimento do novo site da HiperbaricaMT, com estrutura responsiva e preparada para busca por IA.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/orc/hiperbaricaMT' },
  openGraph: {
    title: 'Proposta para HiperbaricaMT',
    description,
    url: 'https://majorhub.com.br/orc/hiperbaricaMT',
    siteName: 'MajorHub',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/orc/hiperbaricaMT/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Proposta de desenvolvimento de site para a HiperbaricaMT',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Proposta para HiperbaricaMT',
    description,
    images: ['/orc/hiperbaricaMT/opengraph-image'],
  },
  robots: { index: false, follow: false, nocache: true },
}

export default function HmtLayout({ children }: { children: React.ReactNode }) {
  return children
}