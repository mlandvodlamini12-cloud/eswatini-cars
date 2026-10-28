// Migration script: upload existing base64 images in listings to Cloudinary
// and update the DB records with short Cloudinary URLs.
//
// Run: node /home/z/my-project/scripts/migrate-base64-to-cloudinary.js
//
// This is a one-time migration. After it runs, the GET /api/listings response
// will shrink from 43MB to ~50KB.

const API_BASE = 'https://eswatini-cars.vercel.app'

async function main() {
  console.log('=== Fetching all listings ===')
  const res = await fetch(`${API_BASE}/api/listings`)
  const data = await res.json()
  const listings = data.listings || []
  console.log(`Total listings: ${listings.length}`)

  // Find listings with base64 data URLs in imageUrl
  const base64Listings = listings.filter(l => {
    const url = l.imageUrl || ''
    return url.startsWith('data:image/')
  })
  console.log(`Listings with base64 images: ${base64Listings.length}`)

  if (base64Listings.length === 0) {
    console.log('✅ No base64 images found. Nothing to migrate.')
    return
  }

  // Login as admin to get session cookie (needed for PATCH)
  console.log('\n=== Logging in as admin ===')
  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mlandvodlamini12@gmail.com', adminPin: '1374' }),
  })
  const setCookie = loginRes.headers.get('set-cookie') || ''
  const cookieMatch = setCookie.match(/ec_session=([^;]+)/)
  if (!cookieMatch) {
    console.error('❌ Failed to login — no session cookie returned')
    process.exit(1)
  }
  const cookie = `ec_session=${cookieMatch[1]}`
  console.log('✅ Logged in as admin')

  let migrated = 0
  let failed = 0

  for (const listing of base64Listings) {
    const { id, make, model, imageUrl } = listing
    console.log(`\n--- Migrating ${id} (${make} ${model}) ---`)

    // Split the imageUrl by | to get individual images
    const images = imageUrl.split('|').filter(Boolean)
    console.log(`  ${images.length} image(s) to upload`)

    const newUrls = []
    for (let i = 0; i < images.length; i++) {
      const dataUrl = images[i]
      if (!dataUrl.startsWith('data:image/')) {
        // Already a URL, keep as-is
        newUrls.push(dataUrl)
        continue
      }

      const sizeKB = Math.round(dataUrl.length / 1024)
      console.log(`  Uploading image ${i + 1}/${images.length} (${sizeKB}KB)...`)

      try {
        const uploadRes = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl }),
        })

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}))
          console.error(`  ❌ Upload failed: ${err.error || uploadRes.status}`)
          failed++
          continue
        }

        const uploadData = await uploadRes.json()
        console.log(`  ✅ Uploaded: ${uploadData.url}`)
        newUrls.push(uploadData.url)
      } catch (err) {
        console.error(`  ❌ Network error: ${err.message}`)
        failed++
      }
    }

    if (newUrls.length === 0) {
      console.log(`  ⚠️  No images uploaded — skipping DB update`)
      continue
    }

    // Update the listing with the new Cloudinary URLs
    const newImageUrl = newUrls.join('|')
    console.log(`  Updating listing with ${newUrls.length} Cloudinary URL(s)...`)

    try {
      const patchRes = await fetch(`${API_BASE}/api/listings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie,
        },
        body: JSON.stringify({ imageUrl: newImageUrl }),
      })

      if (!patchRes.ok) {
        const err = await patchRes.json().catch(() => ({}))
        console.error(`  ❌ PATCH failed: ${err.error || patchRes.status}`)
        failed++
        continue
      }

      console.log(`  ✅ Listing updated`)
      migrated++
    } catch (err) {
      console.error(`  ❌ PATCH network error: ${err.message}`)
      failed++
    }
  }

  console.log(`\n=== Migration complete ===`)
  console.log(`✅ Migrated: ${migrated}`)
  console.log(`❌ Failed: ${failed}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
