// Prisma client with libSQL driver adapter for Turso
// Uses @prisma/adapter-libsql to connect to Turso's hosted SQLite
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL
  const authToken = process.env.DATABASE_AUTH_TOKEN

  if (!url) {
    throw new Error('DATABASE_URL is not set in environment variables')
  }

  // For Turso (libsql://) we use the libSQL adapter
  if (url.startsWith('libsql:')) {
    if (!authToken) {
      throw new Error('DATABASE_AUTH_TOKEN is required for Turso connections')
    }
    // PrismaLibSQL accepts a Config object (url + authToken), not a Client instance
    const adapter = new PrismaLibSQL({ url, authToken })
    return new PrismaClient({ adapter, log: ['warn', 'error'] })
  }

  // For local SQLite (file:) fallback during dev
  return new PrismaClient({ log: ['warn', 'error'] })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
