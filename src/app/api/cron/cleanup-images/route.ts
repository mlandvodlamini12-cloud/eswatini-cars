// GET /api/cron/cleanup-images
// Cron job: delete Cloudinary images for listings that no longer exist.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
})

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expectedSecret = `Bearer ${process.env.CRON_SECRET}`
  if (process.env.CRON_SECRET && authHeader !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[cron] Starting Cloudinary image cleanup...')

  try {
    const listings = await db.listing.findMany({
      where: { imageUrl: { not: null } },
      select: { imageUrl: true },
    })

    const referencedPublicIds = new Set<string>()
    for (const l of listings) {
      if (!l.imageUrl) continue
      const urls = l.imageUrl.split('|').filter(Boolean)
      for (const url of urls) {
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|png|webp|gif)$/i)
        if (match) referencedPublicIds.add(match[1])
      }
    }

    const cloudinaryImages: { public_id: string; bytes: number }[] = []
    let nextCursor: string | undefined
    do {
      const result: any = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'eswatini-cars/',
        max_results: 500,
        next_cursor: nextCursor,
      })
      for (const resource of result.resources) {
        cloudinaryImages.push({ public_id: resource.public_id, bytes: resource.bytes })
      }
      nextCursor = result.next_cursor
    } while (nextCursor)

    const orphans = cloudinaryImages.filter(img => !referencedPublicIds.has(img.public_id))
    console.log(`[cron] Found ${orphans.length} orphaned images`)

    let deleted = 0
    let bytesReclaimed = 0
    const publicIds = orphans.map(o => o.public_id)

    for (let i = 0; i < publicIds.length; i += 100) {
      const batch = publicIds.slice(i, i + 100)
      try {
        await cloudinary.api.delete_resources(batch)
        deleted += batch.length
        bytesReclaimed += orphans
          .slice(i, i + 100)
          .reduce((sum, o) => sum + o.bytes, 0)
      } catch (err) {
        console.error(`[cron] Failed to delete batch:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalCloudinaryImages: cloudinaryImages.length,
        referencedImages: referencedPublicIds.size,
        orphaned: orphans.length,
        deleted,
        bytesReclaimed,
        mbReclaimed: (bytesReclaimed / 1024 / 1024).toFixed(2),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (err: any) {
    console.error('[cron] Cleanup failed:', err)
    return NextResponse.json(
      { error: 'Cleanup failed', message: err?.message || String(err) },
      { status: 500 }
    )
  }
}
