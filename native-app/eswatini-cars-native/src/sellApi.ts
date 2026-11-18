// Sell API — handles image uploads + listing creation
// Calls the SAME endpoints as the web app

import { getSessionCookie } from './auth'

const API_BASE = 'https://eswatini-cars.vercel.app'

// Result type so callers can tell success from failure
export type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string }

/**
 * Upload a single image to Cloudinary via the /api/upload endpoint.
 *
 * Sends the image as FormData (multipart/form-data) — this is the standard
 * way mobile apps send binary files. The server accepts either FormData or
 * JSON, so this works regardless.
 *
 * Returns:
 *   - { success: true, url } on success
 *   - { success: false, error } on failure — the error message can be
 *     shown directly to the user via Alert.alert()
 */
export async function uploadImage(uri: string): Promise<UploadResult> {
  try {
    const cookie = await getSessionCookie()

    const formData = new FormData()
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: `photo-${Date.now()}.jpg`,
    } as any)

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: {
        // NOTE: do NOT set Content-Type manually — fetch auto-sets it to
        // multipart/form-data with the correct boundary when body is FormData.
        // Setting it manually breaks the boundary and the server can't parse.
        Cookie: cookie ? `ec_session=${cookie}` : '',
      },
      body: formData,
    })

    // Try to parse JSON response regardless of status — server always returns JSON
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      // Server returned an error — surface it to the user
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
    // Network error, timeout, etc.
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
