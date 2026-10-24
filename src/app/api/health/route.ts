import { NextResponse } from 'next/server'

// Simple health-check endpoint to verify API routing works without any DB calls
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    runtime: typeof process !== 'undefined' ? 'node' : 'unknown',
    node_version: typeof process !== 'undefined' ? process.version : 'unknown',
    env_check: {
      DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'MISSING',
      DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN ? 'set' : 'MISSING',
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'set' : 'MISSING',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'MISSING',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'set' : 'MISSING',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'set' : 'MISSING',
    },
  })
}
