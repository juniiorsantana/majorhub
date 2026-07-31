import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /orc/ = propostas comerciais, acessadas só por link direto.
        disallow: ['/api/', '/orc/'],
      },
    ],
    sitemap: 'https://majorhub.com.br/sitemap.xml',
  }
}
