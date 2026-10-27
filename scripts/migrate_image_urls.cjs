// Migrate existing listings to use /api/uploads/ instead of /uploads/
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function main() {
  const listings = await db.listing.findMany({
    where: { imageUrl: { contains: '/uploads/' } }
  })

  let updated = 0
  for (const l of listings) {
    if (!l.imageUrl) continue
    const newUrl = l.imageUrl.split(',').map(url => {
      // Replace /uploads/ with /api/uploads/ but keep external URLs (https://...) intact
      if (url.startsWith('/uploads/')) {
        return url.replace('/uploads/', '/api/uploads/')
      }
      return url
    }).join(',')

    if (newUrl !== l.imageUrl) {
      await db.listing.update({
        where: { id: l.id },
        data: { imageUrl: newUrl }
      })
      updated++
    }
  }

  console.log(`✅ Migrated ${updated} of ${listings.length} listings to use /api/uploads/`)
}

main().catch(console.error).finally(() => db.$disconnect())
