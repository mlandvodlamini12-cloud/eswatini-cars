// Test Cloudinary image upload with a small generated PNG (a 100x100 blue square)
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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
})

console.log('=== Cloudinary Configuration ===')
console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`)
console.log(`API Key:    ${process.env.CLOUDINARY_API_KEY}`)
console.log(`API Secret: ${process.env.CLOUDINARY_API_SECRET!.slice(0, 4)}...${process.env.CLOUDINARY_API_SECRET!.slice(-4)}`)
console.log('')

// A tiny 1x1 transparent PNG (base64-encoded)
const TINY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABDQottAAAAABJRU5ErkJggg=='

// A 100x100 blue PNG generated as base64
// We'll use Cloudinary's own URL-based generation to test the upload pipeline
const TEST_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAAOklEQVR4nO3OMQEAAAjDMMC/52FDzDAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB5vQEAAQkBjqUAAAAASUVORK5CYII='

async function main() {
  console.log('=== Uploading test image to Cloudinary ===\n')

  try {
    const result = await cloudinary.uploader.upload(TEST_IMAGE, {
      folder: 'eswatini-cars/test',
      transformation: [
        { width: 200, height: 200, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' },
      ],
      resource_type: 'image',
      public_id: 'connection-test-' + Date.now(),
    })

    console.log('✅ Upload successful!')
    console.log(`   Public ID:   ${result.public_id}`)
    console.log(`   URL:         ${result.secure_url}`)
    console.log(`   Format:      ${result.format}`)
    console.log(`   Width × Height: ${result.width} × ${result.height}`)
    console.log(`   Bytes:       ${result.bytes}`)
    console.log(`   Created at:  ${result.created_at}`)
    console.log('')

    // Now delete the test image (cleanup)
    console.log('=== Cleaning up test image ===')
    const del = await cloudinary.uploader.destroy(result.public_id)
    console.log(`✅ Cleanup result: ${del.result}`)
    console.log('')
    console.log('=== Cloudinary is fully operational! ===')
  } catch (err: any) {
    console.error('❌ Upload failed:', err.message)
    if (err.http_code) console.error('   HTTP code:', err.http_code)
    process.exit(1)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
