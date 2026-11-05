import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deleteFacebookPost } from '@/lib/facebook'
import { verifySessionToken, getSessionCookieName } from '@/lib/session'

// Helper: verify the requester is authenticated and is either the listing
// owner or an admin. Returns the session or null.
async function getAuthorizedSession(req: NextRequest) {
  const token = req.cookies.get(getSessionCookieName())?.value
  if (!token) return null
  return await verifySessionToken(token)
}

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

    // Public view: hide seller phone (private)
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
// SECURITY: Caller must be authenticated AND be the owner or admin.
// Previously had NO server-side auth — anyone could edit any listing!
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // --- AUTH CHECK ---
    const session = await getAuthorizedSession(req)
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to edit a listing.' }, { status: 401 })
    }

    const existing = await db.listing.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const isOwner = existing.sellerEmail && session.email &&
      existing.sellerEmail.toLowerCase() === session.email.toLowerCase()
    const isAdmin = session.role === 'admin'
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'You can only edit listings you created.' }, { status: 403 })
    }
    // --- END AUTH CHECK ---

    const body = await req.json()

    // Build update object — only allow specific fields to be updated
    // SECURITY: Removed 'sellerEmail' from allowed fields to prevent
    // ownership hijacking (changing the email would transfer ownership).
    // Only admins can change 'status' and 'featured'.
    const allowedFields = [
      'type', 'make', 'model', 'year', 'price', 'currency', 'fuelType',
      'transmission', 'mileage', 'color', 'description', 'imageUrl', 'region',
      'sellerName', 'sellerPhone',
    ]
    // Admin-only fields
    const adminOnlyFields = ['status', 'featured']

    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
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
    // Admin-only fields
    if (isAdmin) {
      for (const field of adminOnlyFields) {
        if (body[field] !== undefined) {
          if (field === 'featured') {
            updateData[field] = Boolean(body[field])
          } else {
            updateData[field] = body[field]
          }
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

    // Hide seller phone (private)
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
// SECURITY: Caller must be authenticated AND be the owner or admin.
// Previously had NO server-side auth — anyone could delete any listing!
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // --- AUTH CHECK ---
    const session = await getAuthorizedSession(req)
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to delete a listing.' }, { status: 401 })
    }

    const existing = await db.listing.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const isOwner = existing.sellerEmail && session.email &&
      existing.sellerEmail.toLowerCase() === session.email.toLowerCase()
    const isAdmin = session.role === 'admin'
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'You can only delete listings you created.' }, { status: 403 })
    }
    // --- END AUTH CHECK ---

    // If this listing was cross-posted to Facebook, delete the FB post too
    if (existing.facebookPostId) {
      const fbDeleted = await deleteFacebookPost(existing.facebookPostId)
      if (fbDeleted) {
        console.log(`[DELETE /api/listings/${id}] FB post ${existing.facebookPostId} also deleted`)
      } else {
        console.warn(`[DELETE /api/listings/${id}] FB post ${existing.facebookPostId} could not be deleted`)
      }
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
