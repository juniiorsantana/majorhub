import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /orc/ e /apresentacao/ = material de cliente, acessado só por link direto.
        disallow: ['/api/', '/orc/', '/apresentacao/'],
      },
    ],
    sitemap: 'https://majorhub.com.br/sitemap.xml',
  }
}
