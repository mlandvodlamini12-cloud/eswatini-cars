// Messages API — fetches enquiries + messages for the logged-in user
// Calls the SAME endpoints as the web app

import { getSessionCookie } from './auth'

const API_BASE = 'https://eswatini-cars.vercel.app'

export interface Enquiry {
  id: string
  listingId: string
  buyerName: string
  buyerPhone: string
  buyerEmail?: string
  message: string
  status: string
  createdAt: string
  listing?: {
    make: string
    model: string
    year: number
    price: number
    imageUrl?: string | null
  }
}

export interface Message {
  id: string
  enquiryId: string
  senderRole: string // 'buyer' | 'admin'
  text: string
  createdAt: string
}

export async function fetchEnquiries(): Promise<Enquiry[]> {
  const cookie = await getSessionCookie()
  if (!cookie) return []
  try {
    const res = await fetch(`${API_BASE}/api/enquiries`, {
      headers: { Cookie: `ec_session=${cookie}` },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.enquiries || []
  } catch {
    return []
  }
}

export async function fetchMessages(enquiryId: string): Promise<Message[]> {
  const cookie = await getSessionCookie()
  if (!cookie) return []
  try {
    const res = await fetch(`${API_BASE}/api/enquiries/${enquiryId}/messages`, {
      headers: { Cookie: `ec_session=${cookie}` },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.messages || []
  } catch {
    return []
  }
}

export async function sendMessage(enquiryId: string, text: string): Promise<boolean> {
  const cookie = await getSessionCookie()
  if (!cookie) return false
  try {
    const res = await fetch(`${API_BASE}/api/enquiries/${enquiryId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: `ec_session=${cookie}` },
      body: JSON.stringify({ text, senderRole: 'buyer' }),
    })
    return res.ok
  } catch {
    return false
  }
}
