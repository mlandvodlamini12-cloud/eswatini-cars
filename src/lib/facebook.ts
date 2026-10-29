// Facebook Graph API helper for auto-posting new listings to a Facebook Page.
//
// SETUP (one-time, takes ~10 minutes):
// 1. Go to https://developers.facebook.com/ and create a new App
//    (Type: "Business" — gives access to Pages API)
// 2. Add the "Pages" product to your app
// 3. Go to Graph API Explorer (https://developers.facebook.com/tools/explorer/)
//    - Select your app
//    - Click "Generate Access Token" with these permissions:
//      * pages_show_list
//      * pages_manage_posts
//      * pages_read_engagement
//    - Click "Page Access Token" and select your Facebook Page
// 4. Convert to a long-lived token (valid for ~60 days, must be refreshed):
//    GET https://graph.facebook.com/v21.0/oauth/access_token?
//        grant_type=fb_exchange_token&
//        client_id=YOUR_APP_ID&
//        client_secret=YOUR_APP_SECRET&
//        fb_exchange_token=YOUR_SHORT_LIVED_TOKEN
// 5. Get your Page ID (visible in Graph API Explorer after selecting the page)
// 6. Set these environment variables in Vercel:
//    FACEBOOK_PAGE_ID=your_page_id
//    FACEBOOK_PAGE_ACCESS_TOKEN=your_long_lived_token
//
// The token expires after ~60 days. Facebook will return an error when it
// does — at which point the user repeats steps 3-4 to get a fresh token.
// We log the error but don't fail the listing creation (the listing is the
// primary record; the FB post is a "bonus" that should be best-effort).

const GRAPH_API_VERSION = 'v21.0'
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`

export interface FacebookPostResult {
  success: boolean
  postId?: string
  error?: string
}

/**
 * Post a listing to the configured Facebook Page.
 *
 * - If the listing has image URLs (pipe-separated Cloudinary URLs), we use the
 *   /{page-id}/photos endpoint with `published=true` to publish a photo post
 *   with the listing details as the caption. Multiple photos are uploaded as
 *   a multi-photo post (up to 10 photos per FB API limit).
 * - If the listing has no images, we fall back to /{page-id}/feed for a
 *   text+link post.
 *
 * The function NEVER throws — it catches all errors and returns them in the
 * result object. This is critical because we call this from the listing POST
 * route, and we don't want a Facebook outage to prevent listing creation.
 */
export async function postListingToFacebook(params: {
  listingId: string
  type: string
  make: string
  model: string
  year: number
  price: number
  currency?: string
  fuelType?: string
  transmission?: string
  mileage?: number
  color?: string | null
  region: string
  description: string
  imageUrl?: string | null
}): Promise<FacebookPostResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN

  // If Facebook isn't configured, silently skip — the listing still saves.
  // This lets us deploy the code before the user finishes FB setup.
  if (!pageId || !accessToken) {
    return {
      success: false,
      error: 'FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN not set — skipping FB post',
    }
  }

  // Build the human-readable caption that accompanies the photo(s) or feed post.
  // Format mirrors what a real estate or car dealership would post:
  //   🚗 [Year] [Make] [Model] · [Region]
  //   E [Price] · [Fuel] · [Transmission] · [Mileage] km · [Color]
  //
  //   [Description]
  //
  //   📍 View full details + enquire: https://eswatini-cars.vercel.app
  //   📞 +268 76295648 (broker-supervised viewings)
  const currencySymbol = params.currency === 'ZAR' ? 'R' : 'E'
  const formattedPrice = `${currencySymbol} ${Number(params.price).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`
  const titleLine = `${params.year} ${params.make} ${params.model}`.trim()
  const detailsLine = [
    formattedPrice,
    params.fuelType ? capitalize(params.fuelType) : null,
    params.transmission ? capitalize(params.transmission) : null,
    params.mileage ? `${params.mileage.toLocaleString('en-ZA')} km` : null,
    params.color ? capitalize(params.color) : null,
    params.region,
  ].filter(Boolean).join(' · ')

  const caption = [
    `🚗 ${titleLine}`,
    detailsLine,
    '',
    params.description,
    '',
    `📍 View full details + enquire: https://eswatini-cars.vercel.app`,
    `📞 +268 76295648 (broker-supervised viewings)`,
    `🛡️ Eswatini Cars — Managed Vehicle Marketplace`,
  ].filter((line): line is string => typeof line === 'string').join('\n')

  try {
    // Parse the pipe-separated image URLs into an array.
    // Each URL should be a Cloudinary URL (or any HTTPS URL).
    const imageUrls = (params.imageUrl || '')
      .split('|')
      .map(u => u.trim())
      .filter(u => u.startsWith('http')) // skip base64 data URLs (shouldn't happen post-fix, but be safe)
      .slice(0, 10) // FB API limit: max 10 photos per post

    // CASE 1: Listing has image(s) → publish as a photo post.
    // We use /{page-id}/photos with `published=true` for a single photo,
    // or upload multiple photos as unpublished then create a feed post
    // referencing them (the proper way to do multi-photo posts).
    if (imageUrls.length > 0) {
      if (imageUrls.length === 1) {
        // Single photo — simple case: POST to /{page-id}/photos with caption.
        const res = await fetch(`${GRAPH_API_BASE}/${pageId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: imageUrls[0],
            caption,
            access_token: accessToken,
          }),
        })
        const data = await res.json()
        if (data.error) {
          return { success: false, error: data.error.message }
        }
        return { success: true, postId: data.post_id || data.id }
      }

      // Multiple photos — upload each as unpublished, then create a feed
      // post that references all the uploaded photo IDs.
      // Step 1: Upload each photo with published=false to get their IDs.
      const uploadResults = await Promise.all(
        imageUrls.map(async (url) => {
          try {
            const res = await fetch(`${GRAPH_API_BASE}/${pageId}/photos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url,
                published: false,
                access_token: accessToken,
              }),
            })
            const data = await res.json()
            return data.error ? null : data.id
          } catch {
            return null
          }
        })
      )
      const photoIds = uploadResults.filter((id): id is string => typeof id === 'string')

      if (photoIds.length === 0) {
        return { success: false, error: 'All photo uploads failed' }
      }

      // Step 2: Create a feed post with attached_media referencing all photo IDs.
      const attachedMedia = photoIds.map(id => JSON.stringify({ media_fbid: id }))
      const feedRes = await fetch(`${GRAPH_API_BASE}/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: caption,
          attached_media: attachedMedia,
          access_token: accessToken,
        }),
      })
      const feedData = await feedRes.json()
      if (feedData.error) {
        return { success: false, error: feedData.error.message }
      }
      return { success: true, postId: feedData.id }
    }

    // CASE 2: No images → publish as a text+link feed post.
    const res = await fetch(`${GRAPH_API_BASE}/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: caption,
        link: 'https://eswatini-cars.vercel.app',
        access_token: accessToken,
      }),
    })
    const data = await res.json()
    if (data.error) {
      return { success: false, error: data.error.message }
    }
    return { success: true, postId: data.id }
  } catch (err: any) {
    // Network error, JSON parse error, etc. — never throw to caller.
    return {
      success: false,
      error: err?.message || String(err) || 'Unknown Facebook API error',
    }
  }
}

/**
 * Delete a Facebook post by its ID.
 *
 * Used when a listing is deleted from the marketplace — we also remove the
 * corresponding Facebook post so the page doesn't show stale listings.
 *
 * Like postListingToFacebook, this NEVER throws — best-effort cleanup.
 */
export async function deleteFacebookPost(postId: string): Promise<boolean> {
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  if (!accessToken || !postId) return false

  try {
    const res = await fetch(`${GRAPH_API_BASE}/${postId}?access_token=${accessToken}`, {
      method: 'DELETE',
    })
    const data = await res.json()
    return data.success === true
  } catch {
    return false
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
