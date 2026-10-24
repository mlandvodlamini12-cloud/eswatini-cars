/**
 * Create the Eswatini Cars schema directly in Turso via @libsql/client
 * Run: bun /home/z/my-project/scripts/turso-create-schema.ts
 */
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env manually (bun doesn't auto-load .env in scripts)
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
    // strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}
loadEnv()

const url = process.env.DATABASE_URL
const authToken = process.env.DATABASE_AUTH_TOKEN

console.log('URL:', url ? url.slice(0, 40) + '...' : 'MISSING')
console.log('Token:', authToken ? `[${authToken.length} chars]` : 'MISSING')

if (!url || !authToken) {
  console.error('DATABASE_URL or DATABASE_AUTH_TOKEN is not set')
  process.exit(1)
}

const client = createClient({ url, authToken })

const statements = [
  `CREATE TABLE IF NOT EXISTS Listing (
    id           TEXT PRIMARY KEY NOT NULL,
    type         TEXT NOT NULL,
    make         TEXT NOT NULL,
    model        TEXT NOT NULL,
    year         INTEGER NOT NULL,
    price        REAL NOT NULL,
    currency     TEXT NOT NULL DEFAULT 'SZL',
    fuelType     TEXT NOT NULL,
    transmission TEXT NOT NULL,
    mileage      INTEGER NOT NULL DEFAULT 0,
    color        TEXT,
    description  TEXT NOT NULL,
    imageUrl     TEXT,
    region       TEXT NOT NULL,
    sellerName   TEXT NOT NULL,
    sellerPhone  TEXT NOT NULL,
    sellerEmail  TEXT,
    status       TEXT NOT NULL DEFAULT 'active',
    featured     INTEGER NOT NULL DEFAULT 0,
    views        INTEGER NOT NULL DEFAULT 0,
    createdAt    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS Enquiry (
    id          TEXT PRIMARY KEY NOT NULL,
    listingId   TEXT NOT NULL,
    buyerName   TEXT NOT NULL,
    buyerPhone  TEXT NOT NULL,
    buyerEmail  TEXT,
    message     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'new',
    createdAt   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listingId) REFERENCES Listing(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS Message (
    id         TEXT PRIMARY KEY NOT NULL,
    enquiryId  TEXT NOT NULL,
    sender     TEXT NOT NULL,
    text       TEXT NOT NULL,
    createdAt  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enquiryId) REFERENCES Enquiry(id) ON DELETE CASCADE
  )`,
  // Indices
  `CREATE INDEX IF NOT EXISTS idx_listing_status_featured ON Listing(status, featured)`,
  `CREATE INDEX IF NOT EXISTS idx_listing_region ON Listing(region)`,
  `CREATE INDEX IF NOT EXISTS idx_listing_type ON Listing(type)`,
  `CREATE INDEX IF NOT EXISTS idx_enquiry_listing ON Enquiry(listingId)`,
  `CREATE INDEX IF NOT EXISTS idx_enquiry_status ON Enquiry(status)`,
  `CREATE INDEX IF NOT EXISTS idx_message_enquiry ON Message(enquiryId)`,
]

async function main() {
  console.log(`Connecting to Turso database: ${url}`)
  console.log('Creating schema...\n')

  for (const sql of statements) {
    const label = sql.split('\n')[0].slice(0, 80)
    try {
      await client.execute(sql)
      console.log(`✓ ${label}`)
    } catch (err: any) {
      console.error(`✗ ${label}: ${err.message}`)
      throw err
    }
  }

  // Verify by listing tables
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  console.log('\n=== Tables in database ===')
  for (const row of tables.rows) {
    console.log(`  - ${row.name}`)
  }

  const indices = await client.execute("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name")
  console.log('\n=== Indices ===')
  for (const row of indices.rows) {
    console.log(`  - ${row.name}`)
  }
  console.log('\n✅ Schema created successfully in Turso!')
}

main()
  .catch((err) => {
    console.error('\n❌ Failed:', err)
    process.exit(1)
  })
  .finally(() => client.close())
