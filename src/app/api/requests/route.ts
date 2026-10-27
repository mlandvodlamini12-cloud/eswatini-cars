import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionToken, getSessionCookieName } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    const session = token ? await verifySessionToken(token) : null
    const isAdmin = session?.role === 'admin'
    const requests = await db.vehicleRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
    const safe = requests.map(r => {
      const isOwner = session?.email === r.requesterEmail
      if (isAdmin || isOwner) return r
      return { ...r, requesterEmail: null, requesterPhone: null }
    })
    return NextResponse.json({ requests: safe })
  } catch (err: any) {
    return NextResponse.json({ requests: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const required = ['requesterName', 'requesterEmail', 'requesterPhone', 'vehicleType', 'region']
    for (const f of required) {
      if (!body[f]) return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 })
    }
    const request = await db.vehicleRequest.create({ data: { requesterName: body.requesterName, requesterEmail: body.requesterEmail, requesterPhone: body.requesterPhone, vehicleType: body.vehicleType, make: body.make || null, model: body.model || null, minBudget: body.minBudget || null, maxBudget: body.maxBudget || null, fuelType: body.fuelType || 'any', transmission: body.transmission || 'any', region: body.region, description: body.description || null, status: 'new' } })
    return NextResponse.json({ request })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
