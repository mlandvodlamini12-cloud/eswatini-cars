/**
 * Seed the Eswatini Cars Turso database with a few demo listings
 * for testing the marketplace UI end-to-end.
 * Run: bun run scripts/turso-seed-demo.ts
 */
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env')
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

const cuid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`

const now = () => new Date().toISOString()

const listings = [
  {
    id: cuid('lst'),
    type: 'car',
    make: 'Toyota',
    model: 'Corolla',
    year: 2018,
    price: 185000,
    currency: 'SZL',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: 85000,
    color: 'Silver',
    description: 'Well-maintained single-owner Corolla. Full service history, aircon, power steering, electric windows, central locking. Recently serviced. finance available through local bank.',
    imageUrl: null,
    region: 'Hhohho',
    sellerName: 'Sibusiso Dlamini',
    sellerPhone: '+26876000001',
    sellerEmail: 'sibusiso@example.sz',
    status: 'active',
    featured: 1,
    views: 0,
  },
  {
    id: cuid('lst'),
    type: 'bakkie',
    make: 'Ford',
    model: 'Ranger',
    year: 2020,
    price: 425000,
    currency: 'SZL',
    fuelType: 'Diesel',
    transmission: 'Manual',
    mileage: 62000,
    color: 'White',
    description: 'Ford Ranger XLT 4x2 double cab. Excellent condition, regularly serviced, new tyres. Tow bar, canopy, side steps. Ideal for business or family.',
    imageUrl: null,
    region: 'Manzini',
    sellerName: 'Thandiwe Mkhonta',
    sellerPhone: '+26876000002',
    sellerEmail: 'thandiwe@example.sz',
    status: 'active',
    featured: 1,
    views: 0,
  },
  {
    id: cuid('lst'),
    type: 'car',
    make: 'Volkswagen',
    model: 'Polo',
    year: 2017,
    price: 145000,
    currency: 'SZL',
    fuelType: 'Petrol',
    transmission: 'Manual',
    mileage: 98000,
    color: 'Blue',
    description: 'VW Polo 1.4 Trendline. Economical, perfect for first car buyer. Aircon, ABS, airbags, CD/USB player. Recent service. Papers in order.',
    imageUrl: null,
    region: 'Shiselweni',
    sellerName: 'Mandla Simelane',
    sellerPhone: '+26876000003',
    sellerEmail: null,
    status: 'active',
    featured: 0,
    views: 0,
  },
  {
    id: cuid('lst'),
    type: 'van',
    make: 'Toyota',
    model: 'Quantum',
    year: 2019,
    price: 385000,
    currency: 'SZL',
    fuelType: 'Diesel',
    transmission: 'Manual',
    mileage: 110000,
    color: 'White',
    description: 'Toyota Quantum 14-seater. Kombi business ready. Daily route income generator. Engine overhauled 2024. All seats in good condition.',
    imageUrl: null,
    region: 'Manzini',
    sellerName: 'Taxi Association Member',
    sellerPhone: '+26876000004',
    sellerEmail: 'kombi@example.sz',
    status: 'active',
    featured: 1,
    views: 0,
  },
  {
    id: cuid('lst'),
    type: 'part',
    make: 'Various',
    model: 'Toyota/Honda/Nissan parts',
    year: 2024,
    price: 1500,
    currency: 'SZL',
    fuelType: 'N/A',
    transmission: 'N/A',
    mileage: 0,
    color: null,
    description: 'Bulk lot of used but serviceable parts: alternators, starters, brake pads, headlights. Perfect for small mechanic shop. Negotiable per piece.',
    imageUrl: null,
    region: 'Lubombo',
    sellerName: 'Spare World',
    sellerPhone: '+26876000005',
    sellerEmail: 'spares@example.sz',
    status: 'active',
    featured: 0,
    views: 0,
  },
  {
    id: cuid('lst'),
    type: 'bike',
    make: 'Honda',
    model: 'CBR 250',
    year: 2021,
    price: 68000,
    currency: 'SZL',
    fuelType: 'Petrol',
    transmission: 'Manual',
    mileage: 18000,
    color: 'Red',
    description: 'Honda CBR 250R sports bike. Pristine condition, garaged. Only 18k km. Ideal for delivery business upgrade or weekend rides. Helmet included.',
    imageUrl: null,
    region: 'Hhohho',
    sellerName: 'Sifiso Nhleko',
    sellerPhone: '+26876000006',
    sellerEmail: null,
    status: 'active',
    featured: 0,
    views: 0,
  },
]

async function main() {
  console.log('Seeding Turso database with demo listings...')

  for (const l of listings) {
    await client.execute({
      sql: `INSERT INTO Listing (id, type, make, model, year, price, currency, fuelType, transmission, mileage, color, description, imageUrl, region, sellerName, sellerPhone, sellerEmail, status, featured, views, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [l.id, l.type, l.make, l.model, l.year, l.price, l.currency, l.fuelType, l.transmission, l.mileage, l.color, l.description, l.imageUrl, l.region, l.sellerName, l.sellerPhone, l.sellerEmail, l.status, l.featured, l.views, now(), now()],
    })
    console.log(`✓ Added: ${l.year} ${l.make} ${l.model} — E${l.price.toLocaleString()}`)
  }

  const result = await client.execute('SELECT COUNT(*) AS count FROM Listing')
  console.log(`\n✅ Seeded ${listings.length} listings. Total in DB: ${result.rows[0].count}`)
}

main().catch((e) => { console.error('❌', e); process.exit(1) }).finally(() => client.close())
