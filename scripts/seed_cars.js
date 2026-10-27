// Seed sample Eswatini Cars listings
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function main() {
  // Clear existing
  await db.enquiry.deleteMany()
  await db.listing.deleteMany()

  const listings = [
    {
      type: 'bakkie', make: 'Toyota', model: 'Hilux 2.4 GD-6', year: 2020, price: 385000,
      fuelType: 'diesel', transmission: 'automatic', mileage: 85000, color: 'White',
      description: 'Excellent condition, full service history, accident-free, new tyres, canopy included.',
      region: 'Manzini', sellerName: 'Sipho Dlamini', sellerPhone: '+268 7612 3456',
      imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
      featured: true,
    },
    {
      type: 'car', make: 'Volkswagen', model: 'Polo 1.6 TDI', year: 2019, price: 235000,
      fuelType: 'diesel', transmission: 'manual', mileage: 95000, color: 'Silver',
      description: 'Low mileage, fuel-efficient, perfect for daily commuting. Service book up to date.',
      region: 'Hhohho', sellerName: 'Thandiwe Mamba', sellerPhone: '+268 7801 9988',
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
      featured: true,
    },
    {
      type: 'car', make: 'Mercedes-Benz', model: 'C200 AMG', year: 2021, price: 580000,
      fuelType: 'petrol', transmission: 'automatic', mileage: 42000, color: 'Black',
      description: 'Pristine condition, panoramic roof, leather seats, AMG package, balance of factory warranty.',
      region: 'Hhohho', sellerName: 'Bongani Simelane', sellerPhone: '+268 7605 1122',
      imageUrl: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800',
      featured: true,
    },
    {
      type: 'bakkie', make: 'Ford', model: 'Ranger XLT 2.2', year: 2018, price: 295000,
      fuelType: 'diesel', transmission: 'manual', mileage: 120000, color: 'Blue',
      description: 'Double cab, 4x2, tow bar, rubberised bin, new battery.',
      region: 'Shiselweni', sellerName: 'Mandla Dube', sellerPhone: '+268 7711 4455',
      imageUrl: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800',
    },
    {
      type: 'car', make: 'Toyota', model: 'Corolla Quest 1.6', year: 2017, price: 175000,
      fuelType: 'petrol', transmission: 'manual', mileage: 145000, color: 'Grey',
      description: 'Reliable, economical, perfect first car. Recently serviced.',
      region: 'Manzini', sellerName: 'Nomsa Khumalo', sellerPhone: '+268 7833 6600',
      imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800',
    },
    {
      type: 'van', make: 'Toyota', model: 'Quantum 2.7', year: 2019, price: 425000,
      fuelType: 'diesel', transmission: 'manual', mileage: 110000, color: 'White',
      description: '14-seater kombi, perfect for taxi business. Engine overhauled 10,000km ago.',
      region: 'Lubombo', sellerName: 'Jacob Tsabedze', sellerPhone: '+268 7644 2233',
      imageUrl: 'https://images.unsplash.com/photo-1609520505218-7ca1f5a07dce?w=800',
    },
    {
      type: 'bike', make: 'Yamaha', model: 'MT-07', year: 2020, price: 125000,
      fuelType: 'petrol', transmission: 'manual', mileage: 18000, color: 'Blue',
      description: 'Lightweight sportbike, fun to ride, perfect condition, aftermarket exhaust.',
      region: 'Hhohho', sellerName: 'Lungile Mthembu', sellerPhone: '+268 7912 5577',
      imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
    },
    {
      type: 'part', make: 'Various', model: 'Alloy Wheels (Set of 4)', year: 2023, price: 8500,
      fuelType: 'petrol', transmission: 'manual', mileage: 0, color: 'Black',
      description: '17-inch alloy wheels, 5-bolt pattern, fits VW and Audi. Excellent condition.',
      region: 'Manzini', sellerName: 'Auto Spares Eswatini', sellerPhone: '+268 7699 0011',
      imageUrl: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800',
    },
    {
      type: 'car', make: 'BMW', model: '320i M Sport', year: 2020, price: 475000,
      fuelType: 'petrol', transmission: 'automatic', mileage: 55000, color: 'Alpine White',
      description: 'M Sport package, leather interior, sunroof, navigation, balance of motorplan.',
      region: 'Hhohho', sellerName: 'Sibusiso Nhleko', sellerPhone: '+268 7700 4400',
      imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
      featured: true,
    },
    {
      type: 'car', make: 'Hyundai', model: 'i20 1.4 Fluid', year: 2018, price: 165000,
      fuelType: 'petrol', transmission: 'manual', mileage: 78000, color: 'Red',
      description: 'Economical hatchback, low mileage, FSH, accident-free.',
      region: 'Manzini', sellerName: 'Zanele Mthethwa', sellerPhone: '+268 7822 9911',
      imageUrl: 'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800',
    },
    {
      type: 'bakkie', make: 'Isuzu', model: 'D-Max 1.9 LE', year: 2021, price: 460000,
      fuelType: 'diesel', transmission: 'automatic', mileage: 38000, color: 'Silver',
      description: 'Like new, under warranty, nudge bar, side steps, leather seats.',
      region: 'Lubombo', sellerName: 'Thokozani Gina', sellerPhone: '+268 7633 2211',
      imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    },
    {
      type: 'car', make: 'Audi', model: 'A3 1.4 TFSI', year: 2019, price: 365000,
      fuelType: 'petrol', transmission: 'automatic', mileage: 62000, color: 'Grey',
      description: 'Sportback, S-line package, virtual cockpit, LED headlights.',
      region: 'Hhohho', sellerName: 'Petros Dlamini', sellerPhone: '+268 7744 5566',
      imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    },
  ]

  for (const l of listings) {
    await db.listing.create({ data: l })
  }

  console.log(`✅ Seeded ${listings.length} listings`)
}

main().catch(console.error).finally(() => db.$disconnect())
