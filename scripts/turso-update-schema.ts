/**
 * Update the Eswatini Cars Turso database schema:
 *  - Add User table (for registered accounts)
 *  - Add Broadcast table (for admin announcements)
 *  - Add UserRead table (track which broadcasts each user has read)
 *
 * Run: bun run scripts/turso-update-schema.ts
 *
 * Also creates an initial admin user if it doesn't exist:
 *   Email: mlandvodlamini12@gmail.com
 *   Password: eswatini2026
 */
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import bcrypt from 'bcryptjs'

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

const statements = [
  // === User table ===
  `CREATE TABLE IF NOT EXISTS User (
    id           TEXT PRIMARY KEY NOT NULL,
    email        TEXT NOT NULL UNIQUE,
    name         TEXT NOT NULL,
    phone        TEXT,
    passwordHash TEXT NOT NULL,
    role         TEXT NOT NULL DEFAULT 'user',
    createdAt    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_user_email ON User(email)`,
  `CREATE INDEX IF NOT EXISTS idx_user_role ON User(role)`,

  // === Broadcast table ===
  `CREATE TABLE IF NOT EXISTS Broadcast (
    id         TEXT PRIMARY KEY NOT NULL,
    title      TEXT NOT NULL,
    message    TEXT NOT NULL,
    audience   TEXT NOT NULL DEFAULT 'all',
    status     TEXT NOT NULL DEFAULT 'active',
    createdAt  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiresAt  TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_broadcast_status ON Broadcast(status)`,
  `CREATE INDEX IF NOT EXISTS idx_broadcast_created ON Broadcast(createdAt DESC)`,

  // === UserRead (track read broadcasts per user) ===
  `CREATE TABLE IF NOT EXISTS UserRead (
    id          TEXT PRIMARY KEY NOT NULL,
    userId      TEXT NOT NULL,
    broadcastId TEXT NOT NULL,
    readAt      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (broadcastId) REFERENCES Broadcast(id) ON DELETE CASCADE,
    UNIQUE(userId, broadcastId)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_userread_user ON UserRead(userId)`,
  `CREATE INDEX IF NOT EXISTS idx_userread_broadcast ON UserRead(broadcastId)`,
]

async function main() {
  console.log(`Connecting to Turso database: ${process.env.DATABASE_URL}\n`)
  console.log('=== Updating schema (adding User, Broadcast, UserRead tables) ===\n')

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

  // Create initial admin user
  console.log('\n=== Creating initial admin user ===')
  const ADMIN_EMAIL = 'mlandvodlamini12@gmail.com'
  const ADMIN_PASSWORD = 'eswatini2026'

  const existing = await client.execute({
    sql: 'SELECT id, email, role FROM User WHERE email = ?',
    args: [ADMIN_EMAIL],
  })

  if (existing.rows.length === 0) {
    const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10)
    await client.execute({
      sql: `INSERT INTO User (id, email, name, passwordHash, role, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 'admin', datetime('now'), datetime('now'))`,
      args: [id, ADMIN_EMAIL, 'Mlandvo Dlamini', passwordHash],
    })
    console.log(`✅ Admin user created:`)
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD} (change this after first login!)`)
    console.log(`   Role: admin`)
    console.log(`   ID: ${id}`)
  } else {
    // Update existing user to admin role if needed
    const existingRow: any = existing.rows[0]
    if (existingRow.role !== 'admin') {
      await client.execute({
        sql: `UPDATE User SET role = 'admin', updatedAt = datetime('now') WHERE id = ?`,
        args: [existingRow.id],
      })
      console.log(`✅ Existing user promoted to admin: ${ADMIN_EMAIL}`)
    } else {
      console.log(`✓ Admin user already exists: ${ADMIN_EMAIL}`)
    }
  }

  // Count users
  const count = await client.execute('SELECT COUNT(*) AS count FROM User')
  console.log(`\n✅ Schema updated successfully! Total users: ${count.rows[0].count}`)
}

main()
  .catch((err) => {
    console.error('\n❌ Failed:', err)
    process.exit(1)
  })
  .finally(() => client.close())
