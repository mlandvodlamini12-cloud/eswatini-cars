// Upload APK to Cloudinary using SIGNED upload (with signature)
// Cloudinary's signed uploads bypass the upload preset restriction
import { readFileSync } from 'fs'
import { resolve } from 'path'
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

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!
const API_KEY = process.env.CLOUDINARY_API_KEY!
const API_SECRET = process.env.CLOUDINARY_API_SECRET!

const apkPath = '/home/z/my-project/download/Eswatini-Cars.apk'
const fileBuffer = readFileSync(apkPath)

// Build the params for raw upload
// IMPORTANT: Cloudinary signature rules:
// - Only SIGNABLE params go into the signature (file, signature, api_key are NOT signed)
// - resource_type, public_id, use_filename, etc. ARE signable
// - Must be sorted alphabetically
const timestamp = Math.floor(Date.now() / 1000)
const signableParams: Record<string, string> = {
  public_id: 'Eswatini-Cars.apk',
  timestamp: String(timestamp),
  unique_filename: 'false',
  use_filename: 'true',
  invalidate: 'true',
  overwrite: 'true',
}

// Generate signature: sort params alphabetically, concatenate as key=value&key=value, append API secret, SHA1 hex
const sortedParams = Object.keys(signableParams).sort()
const paramString = sortedParams.map(k => `${k}=${signableParams[k]}`).join('&')
const stringToSign = paramString + API_SECRET
const signature = crypto.createHash('sha1').update(stringToSign).digest('hex')

console.log('=== Upload Parameters ===')
console.log(`Cloud name: ${CLOUD_NAME}`)
console.log(`API key:    ${API_KEY}`)
console.log(`Timestamp:  ${timestamp}`)
console.log(`Signature:  ${signature}`)
console.log(`Signable:   ${paramString}`)
console.log(`File size:  ${fileBuffer.length} bytes`)
console.log('')

// Build multipart form data manually (avoid huge body parsing issues)
const FormData = (await import('form-data')).default
const formData = new FormData()
formData.append('file', fileBuffer, { filename: 'Eswatini-Cars.apk', contentType: 'application/vnd.android.package-archive' })
formData.append('timestamp', String(timestamp))
formData.append('api_key', API_KEY)
formData.append('signature', signature)
formData.append('resource_type', 'raw')
formData.append('public_id', 'Eswatini-Cars.apk')
formData.append('use_filename', 'true')
formData.append('unique_filename', 'false')
formData.append('overwrite', 'true')
formData.append('invalidate', 'true')

const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`

console.log(`Uploading to: ${url}\n`)

// Use fetch with form-data — Cloudinary accepts multipart/form-data
const axios = (await import('axios')).default
try {
  const response = await axios.post(url, formData, {
    headers: formData.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 120000,
  })

  console.log('=== Response ===')
  console.log(JSON.stringify(response.data, null, 2))

  if (response.data.secure_url) {
    console.log('\n=== 🎉 SHAREABLE DOWNLOAD LINK ===')
    console.log(response.data.secure_url)
    console.log('')
    console.log(`Bytes:     ${response.data.bytes}`)
    console.log(`Public ID: ${response.data.public_id}`)
    console.log(`Format:    ${response.data.format}`)
  }
} catch (err: any) {
  console.error('Upload failed:')
  console.error('Status:', err.response?.status)
  console.error('Status text:', err.response?.statusText)
  console.error('Response data:', JSON.stringify(err.response?.data, null, 2))
  console.error('Headers:', err.response?.headers)
  process.exit(1)
}
