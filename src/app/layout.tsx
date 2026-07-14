import type { Metadata, Viewport } from 'next'
import { Sora, Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import SmoothScroll from '@/components/SmoothScroll'

// Preencha com os IDs reais para ativar os trackers.
// Enquanto vazios, os scripts não são injetados (evita 404 e erros no console).
const GTM_ID = ''        // ex.: 'GTM-ABC123'
const META_PIXEL_ID = '' // ex.: '1234567890'

const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://majorhub.com.br'),
  title: 'MajorHub — Marketing, Performance e Criatividade',
  description: 'A MajorHub estrutura o comercial, constrói o site e lapida a identidade visual de empresas que querem crescer no digital com seriedade.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'MajorHub — Marketing, Performance e Criatividade',
    description: 'Sua empresa merece uma marca que vende.',
    url: 'https://majorhub.com.br',
    siteName: 'MajorHub',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MajorHub — Marketing, Performance e Criatividade',
    description: 'Sua empresa merece uma marca que vende.',
  },
}

export const viewport: Viewport = {
  themeColor: '#001a2e',
}

// Dados estruturados: quem é a empresa (SEO + AEO)
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'ProfessionalService'],
  '@id': 'https://majorhub.com.br/#organization',
  name: 'MajorHub',
  url: 'https://majorhub.com.br',
  logo: 'https://majorhub.com.br/opengraph-image',
  description:
    'A MajorHub estrutura o comercial, constrói o site e lapida a identidade visual de empresas que querem crescer no digital com seriedade.',
  areaServed: 'BR',
  knowsAbout: [
    'Estruturação comercial',
    'Criação de sites profissionais',
    'Identidade visual',
    'Marketing digital',
    'Automação de vendas',
    'WhatsApp Business',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    telephone: '+55-65-99217-8164',
    availableLanguage: 'Portuguese',
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://majorhub.com.br/#website',
  name: 'MajorHub',
  url: 'https://majorhub.com.br',
  publisher: { '@id': 'https://majorhub.com.br/#organization' },
  inLanguage: 'pt-BR',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${inter.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <SmoothScroll>
          {children}
        </SmoothScroll>

        {/* Google Tag Manager — só injeta quando GTM_ID estiver definido */}
        {GTM_ID && (
          <Script
            id="gtm"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');`
            }}
          />
        )}

        {/* Meta Pixel — só injeta quando META_PIXEL_ID estiver definido */}
        {META_PIXEL_ID && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `
            }}
          />
        )}

        {/* MajorLeads Tracker */}
        <Script
          src="https://tracker.majorhub.com.br/tracker.js"
          data-token="0edb95ef-d618-4250-9c14-58e9d5ed1e0e"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
