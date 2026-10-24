// Upload APK to Cloudinary using signed upload (server-side, using API secret)
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { v2 as cloudinary } from 'cloudinary'
import crypto from 'crypto'

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

async function main() {
  const apkPath = '/home/z/my-project/download/Eswatini-Cars.apk'
  console.log(`Uploading ${apkPath} to Cloudinary (as raw resource)...`)

  // Simpler approach — minimal params, let Cloudinary auto-name the file
  const result = await cloudinary.uploader.upload(apkPath, {
    resource_type: 'raw',
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    invalidate: true,
  })

  console.log('\n=== Upload successful! ===')
  console.log(`Public ID:    ${result.public_id}`)
  console.log(`URL:          ${result.secure_url}`)
  console.log(`Bytes:        ${result.bytes}`)
  console.log(`Created at:   ${result.created_at}`)

  // Verify it's downloadable
  console.log('\n=== Testing download URL ===')
  const check = await fetch(result.secure_url, { method: 'HEAD' })
  console.log(`HTTP status:  ${check.status}`)
  console.log(`Content-Type: ${check.headers.get('content-type')}`)
  console.log(`Content-Length: ${check.headers.get('content-length')}`)
  console.log(`Content-Disposition: ${check.headers.get('content-disposition')}`)

  // Print final shareable link
  console.log('\n=== 🎉 SHAREABLE DOWNLOAD LINK ===')
  console.log(result.secure_url)
}

main().catch((e) => { console.error(e); process.exit(1) })
