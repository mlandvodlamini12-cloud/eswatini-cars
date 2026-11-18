// Sell API — handles image uploads + listing creation
// Calls the SAME endpoints as the web app

import { getSessionCookie } from './auth'
import { compressImageForUpload } from './compressImage'

const API_BASE = 'https://eswatini-cars.vercel.app'

// Result type so callers can tell success from failure
export type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string }

/**
 * Compress + upload a single image to Cloudinary via the /api/upload endpoint.
 *
 * COMPRESSION IS MANDATORY — Vercel's serverless functions have a 4.5MB body
 * size limit on the free tier. Phone photos are typically 3-8MB. Without
 * compression, uploads silently fail with HTTP 413 FUNCTION_PAYLOAD_TOO_LARGE.
 *
 * After compression: ~200-400KB. Well within the limit.
 *
 * Sends the image as FormData (multipart/form-data) — this is the standard
 * way mobile apps send binary files. The server accepts either FormData or
 * JSON, so this works regardless.
 */
export async function uploadImage(uri: string): Promise<UploadResult> {
  try {
    // STEP 1: Compress the image locally before uploading
    let compressedUri = uri
    try {
      const compressed = await compressImageForUpload(uri)
      compressedUri = compressed.uri
    } catch (compressErr: any) {
      // If compression fails (e.g., corrupt image), fall back to original
      // — the server will likely reject it for being too large, but at
      // least we surface that error rather than failing silently here.
      console.warn('[upload] compression failed, trying original:', compressErr?.message)
    }

    // STEP 2: Upload the compressed image
    const cookie = await getSessionCookie()

    const formData = new FormData()
    formData.append('file', {
      uri: compressedUri,
      type: 'image/jpeg',
      name: `photo-${Date.now()}.jpg`,
    } as any)

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: {
        // NOTE: do NOT set Content-Type manually — fetch auto-sets it to
        // multipart/form-data with the correct boundary when body is FormData.
        Cookie: cookie ? `ec_session=${cookie}` : '',
      },
      body: formData,
    })

    // Try to parse JSON response regardless of status — server always returns JSON
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      // Surface the real error from the server
      return {
        success: false,
        error: data.error || `Upload failed (HTTP ${res.status})`,
      }
    }

    if (!data.url) {
      return {
        success: false,
        error: 'Upload succeeded but no image URL was returned.',
      }
    }

    return { success: true, url: data.url }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error during upload. Check your connection.',
    }
  }
}

// Create a listing
export async function createListing(params: {
  type: string
  make: string
  model: string
  year: number
  price: number
  currency?: string
  fuelType?: string
  transmission?: string
  mileage?: number
  color?: string
  region: string
  description: string
  sellerName: string
  sellerPhone: string
  imageUrls: string[]
}): Promise<{ success: boolean; error?: string; listingId?: string }> {
  try {
    const cookie = await getSessionCookie()
    const res = await fetch(`${API_BASE}/api/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie ? `ec_session=${cookie}` : '',
      },
      body: JSON.stringify({
        ...params,
        imageUrl: params.imageUrls.length > 0 ? params.imageUrls.join('|') : null,
      }),
    })

    const data = await res.json()
    if (!res.ok) return { success: false, error: data.error || 'Failed to create listing' }
    return { success: true, listingId: data.listing?.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' }
  }
}
