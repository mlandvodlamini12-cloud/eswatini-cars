/**
 * Cleanup script: delete Cloudinary images for listings that no longer exist in the database.
 *
 * This script:
 *  1. Lists all images in the Cloudinary `eswatini-cars/listings/` folder
 *  2. Lists all `imageUrl` values in the Turso `Listing` table
 *  3. For each Cloudinary image whose public_id is NOT referenced by any active listing,
 *     deletes the image from Cloudinary (frees up storage = saves money)
 *
 * Run manually: bun run scripts/cleanup-cloudinary-images.ts
 *
 * Or set up as a Vercel Cron Job (every Sunday at 3 AM):
 *   - File: vercel.json
 *     "crons": [{ "path": "/api/cron/cleanup-images", "schedule": "0 3 * * 0" }]
 *   - Endpoint verifies CRON_SECRET header to prevent unauthorized runs
 */
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { v2 as cloudinary } from 'cloudinary'

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local')
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}
loadEnv()

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
})

async function main() {
  console.log('=== Cloudinary Image Cleanup ===\n')

  // Step 1: Get all imageUrl values from the Listing table (active + sold)
  console.log('Step 1: Fetching image URLs from Turso Listing table...')
  const result = await client.execute('SELECT imageUrl FROM Listing WHERE imageUrl IS NOT NULL')
  const dbImageUrls: string[] = []
  for (const row of result.rows) {
    const url = row.imageUrl as string
    if (!url) continue
    // imageUrl may be pipe-separated (multiple images)
    const urls = url.split('|').filter(Boolean)
    dbImageUrls.push(...urls)
  }
  console.log(`✓ Found ${dbImageUrls.length} image URLs referenced by active listings\n`)

  // Step 2: Get the public_ids of these URLs
  const referencedPublicIds = new Set<string>()
  for (const url of dbImageUrls) {
    // Cloudinary URLs look like:
    // https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.jpg
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|png|webp|gif)$/i)
    if (match) {
      referencedPublicIds.add(match[1])
    }
  }
  console.log(`✓ Extracted ${referencedPublicIds.size} unique Cloudinary public_ids from DB`)

  // Step 3: List all images in the eswatini-cars folder on Cloudinary
  console.log('\nStep 2: Listing all images in eswatini-cars folder on Cloudinary...')
  const cloudinaryImages: { public_id: string; bytes: number; created_at: string }[] = []
  let nextCursor: string | undefined
  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'eswatini-cars/',
      max_results: 500,
      next_cursor: nextCursor,
    })
    for (const resource of result.resources) {
      cloudinaryImages.push({
        public_id: resource.public_id,
        bytes: resource.bytes,
        created_at: resource.created_at,
      })
    }
    nextCursor = result.next_cursor
  } while (nextCursor)
  console.log(`✓ Found ${cloudinaryImages.length} images on Cloudinary\n`)

  // Step 4: Find orphaned images (not referenced by any listing)
  console.log('Step 3: Identifying orphaned images...')
  const orphans = cloudinaryImages.filter(img => !referencedPublicIds.has(img.public_id))
  console.log(`✓ Found ${orphans.length} orphaned images\n`)

  if (orphans.length === 0) {
    console.log('✅ No cleanup needed — all Cloudinary images are referenced by active listings.')
    return
  }

  // Step 5: Show what will be deleted (dry run by default)
  console.log('=== ORPHANED IMAGES (would be deleted) ===')
  let totalBytes = 0
  for (const orphan of orphans.slice(0, 50)) {
    console.log(`  - ${orphan.public_id} (${(orphan.bytes / 1024).toFixed(1)} KB, ${orphan.created_at})`)
    totalBytes += orphan.bytes
  }
  if (orphans.length > 50) {
    console.log(`  ... and ${orphans.length - 50} more`)
  }
  console.log(`\nTotal storage to reclaim: ${(totalBytes / 1024 / 1024).toFixed(2)} MB\n`)

  // Step 6: Confirm + delete (only if --delete flag is passed)
  const shouldDelete = process.argv.includes('--delete')
  if (!shouldDelete) {
    console.log('=== DRY RUN — no images were deleted ===')
    console.log('To actually delete these orphaned images, run:')
    console.log('  bun run scripts/cleanup-cloudinary-images.ts --delete')
    return
  }

  console.log('=== DELETING ORPHANED IMAGES ===')
  const publicIds = orphans.map(o => o.public_id)
  // Cloudinary allows batch delete (max 100 per call)
  let deleted = 0
  let failed = 0
  for (let i = 0; i < publicIds.length; i += 100) {
    const batch = publicIds.slice(i, i + 100)
    try {
      const result = await cloudinary.api.delete_resources(batch)
      deleted += batch.length
      console.log(`✓ Deleted batch ${Math.floor(i / 100) + 1} (${batch.length} images)`)
    } catch (err: any) {
      failed += batch.length
      console.error(`✗ Failed batch ${Math.floor(i / 100) + 1}: ${err.message}`)
    }
  }

  console.log(`\n✅ Cleanup complete!`)
  console.log(`   Deleted: ${deleted} images`)
  console.log(`   Failed:  ${failed} images`)
  console.log(`   Storage reclaimed: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`)
}

main()
  .catch((err) => {
    console.error('\n❌ Cleanup failed:', err)
    process.exit(1)
  })
  .finally(() => client.close())
