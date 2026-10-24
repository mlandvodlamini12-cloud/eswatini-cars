import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/listings/[id] — fetch single listing with full details + increment view counter
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const listing = await db.listing.findUnique({ where: { id } })

    if (!listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Increment view counter (fire-and-forget)
    db.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    }).catch((e) => console.error('[view increment] failed:', e))

    // Public view: hide seller phone (private), but keep sellerEmail so client can check ownership
    const { sellerPhone, ...safe } = listing
    return NextResponse.json({ listing: safe })
  } catch (err: any) {
    console.error('[GET /api/listings/[id]] error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch listing', message: err?.message || String(err) },
      { status: 500 }
    )
  }
}

// PATCH /api/listings/[id] — update an existing listing
// Used by the Edit Listing form. Caller must be the owner or an admin.
// NOTE: In a future version, add session-based auth to enforce ownership server-side.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Verify the listing exists
    const existing = await db.listing.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Build update object — only allow specific fields to be updated
    const allowedFields = [
      'type', 'make', 'model', 'year', 'price', 'currency', 'fuelType',
      'transmission', 'mileage', 'color', 'description', 'imageUrl', 'region',
      'sellerName', 'sellerPhone', 'sellerEmail', 'status', 'featured',
    ]
    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Type-convert numeric fields
        if (['year', 'mileage', 'views'].includes(field)) {
          updateData[field] = Number(body[field])
        } else if (['price'].includes(field)) {
          updateData[field] = Number(body[field])
        } else if (['featured'].includes(field)) {
          updateData[field] = Boolean(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const updated = await db.listing.update({
      where: { id },
      data: updateData,
    })

    // Hide seller phone (private), keep sellerEmail for ownership check
    const { sellerPhone, ...safe } = updated
    return NextResponse.json({ listing: safe })
  } catch (err: any) {
    console.error('[PATCH /api/listings/[id]] error:', err)
    return NextResponse.json(
      { error: 'Failed to update listing', message: err?.message || String(err) },
      { status: 500 }
    )
  }
}

// DELETE /api/listings/[id] — permanently delete a listing
// Used by the Delete button. Caller must be the owner or an admin (client-side check;
// TODO: add server-side session check in a future auth implementation)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify the listing exists
    const existing = await db.listing.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Delete the listing (cascade will also delete related enquiries + messages)
    await db.listing.delete({ where: { id } })

    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    console.error('[DELETE /api/listings/[id]] error:', err)
    return NextResponse.json(
      { error: 'Failed to delete listing', message: err?.message || String(err) },
      { status: 500 }
    )
  }
}
