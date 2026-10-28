// Quick cleanup + migration: delete duplicate VW TSI test listings,
// migrate BMW listings' base64 images to Cloudinary.
//
// Run: node /home/z/my-project/scripts/cleanup-and-migrate.js

const API_BASE = 'https://eswatini-cars.vercel.app'

async function main() {
  // Login as admin
  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mlandvodlamini12@gmail.com', adminPin: '1374' }),
  })
  const setCookie = loginRes.headers.get('set-cookie') || ''
  const cookieMatch = setCookie.match(/ec_session=([^;]+)/)
  const cookie = `ec_session=${cookieMatch[1]}`
  console.log('✅ Logged in as admin')

  // Fetch listings (this is 30MB but we need the IDs)
  console.log('Fetching listings...')
  const res = await fetch(`${API_BASE}/api/listings`)
  const data = await res.json()
  const listings = data.listings || []
  console.log(`Total listings: ${listings.length}`)

  // Group VW TSI listings (all identical — keep only the newest one)
  const vwTsiListings = listings.filter(l => l.make === 'VW' && l.model === 'TSI')
  console.log(`\nVW TSI listings (duplicates): ${vwTsiListings.length}`)

  // Sort by createdAt desc — keep the newest, delete the rest
  vwTsiListings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const keepVw = vwTsiListings[0]
  const deleteVw = vwTsiListings.slice(1)
  console.log(`Keeping: ${keepVw.id} (created ${keepVw.createdAt})`)
  console.log(`Deleting: ${deleteVw.length} duplicates`)

  for (const l of deleteVw) {
    process.stdout.write(`  Deleting ${l.id}...`)
    const delRes = await fetch(`${API_BASE}/api/listings/${l.id}`, {
      method: 'DELETE',
      headers: { 'Cookie': cookie },
    })
    console.log(delRes.ok ? ' ✅' : ` ❌ ${delRes.status}`)
  }

  // Migrate remaining base64 listings to Cloudinary
  const remainingBase64 = listings.filter(l => {
    return (l.imageUrl || '').startsWith('data:image/') &&
           !(l.make === 'VW' && l.model === 'TSI') // skip VW TSI (already handled)
  })
  // Also migrate the 1 remaining VW TSI listing
  if (keepVw && (keepVw.imageUrl || '').startsWith('data:image/')) {
    remainingBase64.push(keepVw)
  }

  console.log(`\nMigrating ${remainingBase64.length} listing(s) to Cloudinary...`)

  for (const listing of remainingBase64) {
    const { id, make, model, imageUrl } = listing
    console.log(`\n--- ${id} (${make} ${model}) ---`)
    const images = imageUrl.split('|').filter(Boolean)
    console.log(`  ${images.length} image(s)`)

    const newUrls = []
    for (let i = 0; i < images.length; i++) {
      const dataUrl = images[i]
      if (!dataUrl.startsWith('data:image/')) {
        newUrls.push(dataUrl)
        continue
      }
      const sizeKB = Math.round(dataUrl.length / 1024)
      process.stdout.write(`  Upload ${i + 1}/${images.length} (${sizeKB}KB)...`)
      try {
        const uploadRes = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl }),
        })
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}))
          console.log(` ❌ ${err.error || uploadRes.status}`)
          continue
        }
        const uploadData = await uploadRes.json()
        newUrls.push(uploadData.url)
        console.log(` ✅`)
      } catch (err) {
        console.log(` ❌ ${err.message}`)
      }
    }

    if (newUrls.length === 0) {
      console.log(`  ⚠️  No images uploaded — skipping`)
      continue
    }

    const newImageUrl = newUrls.join('|')
    process.stdout.write(`  PATCH listing...`)
    const patchRes = await fetch(`${API_BASE}/api/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ imageUrl: newImageUrl }),
    })
    console.log(patchRes.ok ? ' ✅' : ` ❌ ${patchRes.status}`)
  }

  console.log('\n=== Done ===')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
