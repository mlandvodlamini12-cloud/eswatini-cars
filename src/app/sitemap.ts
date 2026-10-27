// Dynamic sitemap.xml — auto-generates from Turso database listings
// Free forever (no third-party service needed)
import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://eswatini-cars.vercel.app'

  // Static pages — always include
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ]

  try {
    // Dynamic pages — one per active listing
    const listings = await db.listing.findMany({
      where: { status: 'active' },
      select: { id: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
      take: 1000, // Cap at 1000 listings (Google's recommended max)
    })

    const listingPages: MetadataRoute.Sitemap = listings.map(l => ({
      url: `${baseUrl}/?listing=${l.id}`,
      lastModified: l.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...listingPages]
  } catch (err) {
    console.error('[sitemap] failed:', err)
    // Fallback: just return static pages if DB is unreachable
    return staticPages
  }
}
