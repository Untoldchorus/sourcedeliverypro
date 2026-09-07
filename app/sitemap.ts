import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sourcedeliverypro.com'

  const routes = [
    '',
    '/services',
    '/tracking',
    '/shipping/quote',
    '/shipping',
    '/locations',
    '/business',
    '/support',
    '/about',
    '/contact',
    '/careers',
    '/blog',
    '/terms',
    '/privacy',
    '/prohibited',
    '/refunds',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))
}