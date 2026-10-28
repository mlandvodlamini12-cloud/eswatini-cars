import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionToken, getSessionCookieName } from '@/lib/session'

// Helper: read the session from the request cookie and return the matching
// user (or null if unauthenticated). We need this to enforce that only the
// original requester (or an admin) can edit or delete a vehicle request —
// otherwise any logged-in user could delete other people's requests.
async function getAuthenticatedUser(req: NextRequest) {
  const token = req.cookies.get(getSessionCookieName())?.value
  if (!token) return null
  const session = await verifySessionToken(token)
  if (!session) return null
  // Fetch the user record so we can compare email + role.
  const user = await db.user.findUnique({ where: { email: session.email } })
  return user
}

// Helper: load a request by id, returning 404 if missing. Used by both
// PATCH and DELETE so we have a single source of truth for the lookup.
async function getRequest(id: string) {
  if (!id) return null
  try {
    return await db.vehicleRequest.findUnique({ where: { id } })
  } catch {
    return null
  }
}

// PATCH /api/requests/[id] — update an existing vehicle request.
//
// Request body: any subset of the editable fields (requesterName, vehicleType,
// make, model, minBudget, maxBudget, fuelType, transmission, region,
// description). Status cannot be edited by the user (only admins change it
// via the dashboard).
//
// Authorization: only the original requester (matched by email) or an admin
// can edit. Otherwise 403.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to edit a request.' }, { status: 401 })
    }

    const existing = await getRequest(id)
    if (!existing) {
      return NextResponse.json({ error: 'Request not found.' }, { status: 404 })
    }

    const isOwner = existing.requesterEmail.toLowerCase() === user.email.toLowerCase()
    const isAdmin = user.role === 'admin'
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'You can only edit your own requests.' }, { status: 403 })
    }

    const body = await req.json()

    // Build the update payload — only allow the user to change these specific
    // fields. We do NOT let them change requesterEmail or status here
    // (status is admin-only, requesterEmail would let them steal the request).
    const allowedFields = [
      'requesterName', 'requesterPhone', 'vehicleType',
      'make', 'model', 'minBudget', 'maxBudget',
      'fuelType', 'transmission', 'region', 'description',
    ]
    const data: Record<string, unknown> = {}
    for (const f of allowedFields) {
      if (body[f] !== undefined) {
        // Empty strings are converted to null for nullable fields
        if (['make', 'model', 'minBudget', 'maxBudget', 'description', 'requesterPhone'].includes(f) && body[f] === '') {
          data[f] = null
        } else {
          data[f] = body[f]
        }
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
    }

    const updated = await db.vehicleRequest.update({ where: { id }, data })
    return NextResponse.json({ request: updated })
  } catch (err: any) {
    console.error('[api/requests/[id]] PATCH error:', err)
    return NextResponse.json(
      { error: 'Failed to update request', message: err?.message || String(err) },
      { status: 500 }
    )
  }
}

// DELETE /api/requests/[id] — delete an existing vehicle request.
//
// Authorization: only the original requester (matched by email) or an admin
// can delete. Otherwise 403.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to delete a request.' }, { status: 401 })
    }

    const existing = await getRequest(id)
    if (!existing) {
      return NextResponse.json({ error: 'Request not found.' }, { status: 404 })
    }

    const isOwner = existing.requesterEmail.toLowerCase() === user.email.toLowerCase()
    const isAdmin = user.role === 'admin'
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'You can only delete your own requests.' }, { status: 403 })
    }

    await db.vehicleRequest.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[api/requests/[id]] DELETE error:', err)
    return NextResponse.json(
      { error: 'Failed to delete request', message: err?.message || String(err) },
      { status: 500 }
    )
  }
}
