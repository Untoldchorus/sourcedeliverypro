import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  const baseUrl = envUrl && !envUrl.includes('vercel.app') && !envUrl.includes('localhost')
    ? envUrl.replace(/\/$/, '')
    : 'https://www.sourcedeliverypro.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/staff/', '/driver/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}