// Sell API — handles image uploads + listing creation
// Calls the SAME endpoints as the web app

import { getSessionCookie } from './auth'

const API_BASE = 'https://eswatini-cars.vercel.app'

// Upload a single image to Cloudinary via the /api/upload endpoint
export async function uploadImage(uri: string): Promise<string | null> {
  try {
    const cookie = await getSessionCookie()
    const formData = new FormData()
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any)

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: {
        Cookie: cookie ? `ec_session=${cookie}` : '',
      },
      body: formData,
    })

    if (!res.ok) return null
    const data = await res.json()
    return data.url || data.secure_url || null
  } catch {
    return null
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
