// robots.txt — tells Google + other search engines what they can crawl
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://eswatini-cars.vercel.app'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Don't index admin/API routes
      disallow: ['/api/admin', '/api/auth', '/api/cron'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
