import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/listings — list all active listings (with optional filters)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const type = searchParams.get('type')
    const make = searchParams.get('make')
    const fuel = searchParams.get('fuel')
    const transmission = searchParams.get('transmission')
    const region = searchParams.get('region')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const q = searchParams.get('q')

    const where: any = { status: 'active' }
    if (type && type !== 'all') where.type = type
    if (make) where.make = { contains: make }
    if (fuel && fuel !== 'all') where.fuelType = fuel
    if (transmission && transmission !== 'all') where.transmission = transmission
    if (region && region !== 'all') where.region = region

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = Number(minPrice)
      if (maxPrice) where.price.lte = Number(maxPrice)
    }

    if (q) {
      where.OR = [
        { make: { contains: q } },
        { model: { contains: q } },
        { color: { contains: q } },
      ]
    }

    const listings = await db.listing.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    })

    // Hide seller phone (private), but keep sellerEmail so client can check ownership
    const safe = listings.map(({ sellerPhone, ...rest }) => rest)
    return NextResponse.json({ listings: safe })
  } catch (err: any) {
    console.error('[api/listings] GET error:', err)
    return NextResponse.json(
      {
        error: 'Failed to fetch listings',
        message: err?.message || String(err),
        stack: process.env.NODE_ENV === 'production' ? undefined : err?.stack,
      },
      { status: 500 }
    )
  }
}

// POST /api/listings — create a new listing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const required = ['type', 'make', 'model', 'year', 'price', 'fuelType', 'transmission', 'description', 'region', 'sellerName', 'sellerPhone']
    for (const f of required) {
      if (!body[f]) {
        return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 })
      }
    }

    const listing = await db.listing.create({
      data: {
        type: body.type,
        make: body.make,
        model: body.model,
        year: Number(body.year),
        price: Number(body.price),
        currency: body.currency || 'SZL',
        fuelType: body.fuelType,
        transmission: body.transmission,
        mileage: Number(body.mileage) || 0,
        color: body.color || null,
        description: body.description,
        imageUrl: body.imageUrl || null,
        region: body.region,
        sellerName: body.sellerName,
        sellerPhone: body.sellerPhone,
        sellerEmail: body.sellerEmail || null,
      },
    })

    const { sellerPhone, ...safe } = listing
    return NextResponse.json({ listing: safe })
  } catch (err: any) {
    console.error('[api/listings] POST error:', err)
    return NextResponse.json(
      {
        error: 'Failed to create listing',
        message: err?.message || String(err),
      },
      { status: 500 }
    )
  }
}
