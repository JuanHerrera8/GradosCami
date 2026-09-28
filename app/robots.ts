import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith('http')
    ? process.env.NEXT_PUBLIC_APP_URL
    : 'https://www.tarjeton.online'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/gestionar/', '/api/'], // Proteger paneles privados
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
