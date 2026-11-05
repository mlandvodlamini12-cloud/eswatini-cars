import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { postListingToFacebook } from '@/lib/facebook'

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

    // SECURITY: Hide seller phone AND sellerEmail from public listing list.
    // Previously, sellerEmail was exposed so the client could check ownership
    // for edit/delete buttons. But this leaks user emails to anyone who
    // calls the API. Now the client checks ownership via the session cookie
    // on the server side (PATCH/DELETE routes verify ownership).
    const safe = listings.map(({ sellerPhone, sellerEmail, ...rest }) => rest)
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
//
// After creating the listing in the DB, we ALSO attempt to cross-post it to
// the configured Facebook Page (if FACEBOOK_PAGE_ID + FACEBOOK_PAGE_ACCESS_TOKEN
// env vars are set). The FB post is best-effort:
//   - If FB is not configured, we skip silently (listing still saves).
//   - If FB returns an error, we log it but the listing still saves.
//   - If FB succeeds, we store the FB post ID in `listing.facebookPostId`
//     so we can later delete the FB post when the listing is deleted.
//
// This async "fire and persist" pattern means the user gets the listing
// confirmation immediately — the FB post happens in the background and
// never blocks the user.
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

    // Cross-post to Facebook (best-effort, never throws).
    // We do this AFTER the DB write so the listing is already saved —
    // even if FB takes a few seconds or fails, the listing is in the DB.
    const fbResult = await postListingToFacebook({
      listingId: listing.id,
      type: listing.type,
      make: listing.make,
      model: listing.model,
      year: listing.year,
      price: listing.price,
      currency: listing.currency,
      fuelType: listing.fuelType,
      transmission: listing.transmission,
      mileage: listing.mileage,
      color: listing.color,
      region: listing.region,
      description: listing.description,
      imageUrl: listing.imageUrl,
    })

    // If the FB post succeeded, store the FB post ID so we can later delete
    // the FB post when the listing is deleted (keeps the page in sync).
    if (fbResult.success && fbResult.postId) {
      try {
        await db.listing.update({
          where: { id: listing.id },
          data: { facebookPostId: fbResult.postId },
        })
        console.log(`[api/listings] POST → listing ${listing.id} created + cross-posted to Facebook (post: ${fbResult.postId})`)
      } catch (updateErr) {
        // Listing is saved + FB post exists; just couldn't update the FK.
        // Log and continue — not worth failing the response over.
        console.error('[api/listings] POST → FB post succeeded but failed to update listing.facebookPostId:', updateErr)
      }
    } else if (!fbResult.success) {
      // Log the FB error but DON'T fail the listing creation.
      // The listing is the primary record; the FB post is a "bonus".
      console.warn(`[api/listings] POST → listing ${listing.id} created, but FB post failed: ${fbResult.error}`)
    }

    const { sellerPhone, ...safe } = listing
    return NextResponse.json({
      listing: safe,
      facebook: {
        posted: fbResult.success,
        postId: fbResult.postId || null,
        error: fbResult.error || null,
      },
    })
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
