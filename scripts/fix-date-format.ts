/**
 * Fix date format issue: Turso stored dates as "YYYY-MM-DD HH:MM:SS" (SQLite format)
 * but Prisma expects ISO 8601 format "YYYY-MM-DDTHH:MM:SS.sssZ".
 *
 * This script updates all date columns in User, Broadcast, UserRead tables to use ISO format.
 */
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

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

async function main() {
  console.log('=== Fixing date format in User, Broadcast, UserRead tables ===\n')

  // Function to convert SQLite datetime string to ISO format
  // Input: "2026-10-25 10:41:49" (SQLite format)
  // Output: "2026-10-25T10:41:49.000Z" (ISO 8601 with Z suffix)
  function toISO(sqliteDate: string): string {
    // If already ISO format, leave alone
    if (sqliteDate.includes('T') && (sqliteDate.endsWith('Z') || sqliteDate.includes('.'))) {
      return sqliteDate
    }
    // Convert "YYYY-MM-DD HH:MM:SS" → "YYYY-MM-DDTHH:MM:SS.000Z"
    return sqliteDate.replace(' ', 'T') + '.000Z'
  }

  // Fix User table
  const tables = ['User', 'Broadcast', 'UserRead', 'Listing', 'Enquiry', 'Message']
  for (const table of tables) {
    try {
      const result = await client.execute(`SELECT id, createdAt, updatedAt FROM ${table}`)
      console.log(`Checking ${table}: ${result.rows.length} rows`)
      let fixed = 0
      for (const row of result.rows) {
        const createdAt = row.createdAt as string
        const updatedAt = row.updatedAt as string
        const newCreated = createdAt ? toISO(createdAt) : null
        const newUpdated = updatedAt ? toISO(updatedAt) : null
        if ((createdAt && newCreated !== createdAt) || (updatedAt && newUpdated !== updatedAt)) {
          await client.execute({
            sql: `UPDATE ${table} SET createdAt = ?, updatedAt = ? WHERE id = ?`,
            args: [newCreated, newUpdated, row.id as string],
          })
          fixed++
        }
      }
      if (fixed > 0) {
        console.log(`  ✓ Fixed ${fixed} rows in ${table}`)
      }
    } catch (err: any) {
      console.log(`  ⚠ Skipping ${table}: ${err.message}`)
    }
  }

  console.log('\n✅ Date format migration complete!')
}

main()
  .catch((err) => {
    console.error('\n❌ Failed:', err)
    process.exit(1)
  })
  .finally(() => client.close())
