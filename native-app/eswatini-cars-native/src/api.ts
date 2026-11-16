// API service for the Eswatini Cars native app.
// Calls the SAME API endpoints as the web app (hosted on Vercel).

const API_BASE = 'https://eswatini-cars.vercel.app'

export interface Listing {
  id: string
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
  description?: string
  imageUrl?: string | null
  featured?: boolean
  sellerName?: string
  sellerPhone?: string
  createdAt: string
}

export async function fetchListings(type?: string): Promise<Listing[]> {
  const url = type && type !== 'all'
    ? `${API_BASE}/api/listings?type=${encodeURIComponent(type)}`
    : `${API_BASE}/api/listings`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch listings: ${res.status}`)
  const data = await res.json()
  return data.listings || []
}

export async function fetchListingDetail(id: string): Promise<Listing | null> {
  const res = await fetch(`${API_BASE}/api/listings/${id}`)
  if (!res.ok) return null
  const data = await res.json()
  return data.listing || null
}
