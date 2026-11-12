import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionToken, getSessionCookieName } from '@/lib/session'

// DELETE — truly delete a broadcast (and its UserRead records).
// Previously this only archived (set status='archived'), which left the broadcast
// in the DB. The user asked for a real delete so they can remove broadcasts they
// posted by mistake. We cascade-delete UserRead records first to avoid orphaned refs.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const session = await verifySessionToken(token)
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    const { id } = await params
    // Cascade: delete UserRead records first (no FK constraint in schema, so manual)
    await db.userRead.deleteMany({ where: { broadcastId: id } })
    // Then delete the broadcast itself
    await db.broadcast.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete broadcast' }, { status: 500 })
  }
}

// PATCH — edit an existing broadcast's title, message, and/or audience.
// Used by the admin dashboard's "Edit" button. Only updates fields that are
// present in the request body, so partial edits are safe.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const session = await verifySessionToken(token)
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { title, message, audience } = body
    // Validate: at least one field must be provided
    if (!title && !message && !audience) {
      return NextResponse.json({ error: 'Nothing to update — provide title, message, or audience' }, { status: 400 })
    }
    // Validate non-empty values if provided
    if (title !== undefined && (!title || !title.trim())) {
      return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
    }
    if (message !== undefined && (!message || !message.trim())) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }
    if (audience !== undefined && !['all', 'registered'].includes(audience)) {
      return NextResponse.json({ error: 'Audience must be "all" or "registered"' }, { status: 400 })
    }
    // Build update object with only provided fields
    const update: any = {}
    if (title !== undefined) update.title = title.trim()
    if (message !== undefined) update.message = message.trim()
    if (audience !== undefined) update.audience = audience
    const updated = await db.broadcast.update({ where: { id }, data: update })
    return NextResponse.json({ broadcast: updated })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update broadcast' }, { status: 500 })
  }
}
