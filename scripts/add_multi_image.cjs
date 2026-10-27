// Add a sample listing with multiple images to showcase the gallery feature
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function main() {
  // Add a multi-image BMW listing
  const multi = await db.listing.create({
    data: {
      type: 'car',
      make: 'BMW',
      model: 'M3 Competition',
      year: 2022,
      price: 1250000,
      fuelType: 'petrol',
      transmission: 'automatic',
      mileage: 15000,
      color: 'Alpine White',
      description: 'Like-new M3 Competition. Carbon ceramic brakes, full leather, Harman Kardon. Multi-angle photos included. Viewings welcome.',
      imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800,https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800,https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800,https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
      region: 'Hhohho',
      sellerName: 'Muzi Dlamini',
      sellerPhone: '+268 7700 1234',
      featured: true,
    }
  })

  console.log('✅ Added multi-image listing:', multi.id)
  console.log('Images:', multi.imageUrl.split(',').length)
}

main().catch(console.error).finally(() => db.$disconnect())
