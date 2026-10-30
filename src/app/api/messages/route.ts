import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionToken, getSessionCookieName } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    const session = token ? await verifySessionToken(token) : null
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const where = session.role === 'admin' ? {} : { userEmail: session.email }
    const messages = await db.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { replies: { orderBy: { createdAt: 'asc' } } } })
    return NextResponse.json({ messages })
  } catch (err: any) {
    return NextResponse.json({ messages: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    const session = token ? await verifySessionToken(token) : null
    if (!session) return NextResponse.json({ error: 'Please log in to send a message' }, { status: 401 })
    const body = await req.json()
    const { subject, message } = body
    if (!subject || !message) return NextResponse.json({ error: 'Subject and message required' }, { status: 400 })
    const user = await db.user.findUnique({ where: { id: session.userId }, select: { username: true } })
    const msg = await db.contactMessage.create({ data: { userEmail: session.email, username: user?.username || session.email, subject, message, status: 'new' } })
    return NextResponse.json({ message: msg })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    const session = token ? await verifySessionToken(token) : null
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const body = await req.json()

    // Handle "mark as read" — marks all of the user's 'responded' messages
    // as 'read' so the unread badge disappears from the Messages button.
    // Triggered when the user opens the Messages inbox view.
    if (body.markAsRead) {
      if (session.role === 'admin') {
        // Admin sees all messages — mark all 'responded' as 'read'
        await db.contactMessage.updateMany({
          where: { status: 'responded' },
          data: { status: 'read' },
        })
      } else {
        // Regular user — only mark their own 'responded' messages as 'read'
        await db.contactMessage.updateMany({
          where: { userEmail: session.email, status: 'responded' },
          data: { status: 'read' },
        })
      }
      return NextResponse.json({ success: true, message: 'Messages marked as read' })
    }

    // Handle reply (existing behavior)
    const { id, response } = body
    if (!id || !response) return NextResponse.json({ error: 'id and response required' }, { status: 400 })
    const existing = await db.contactMessage.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    const isAdmin = session.role === 'admin'
    const isOwner = existing.userEmail === session.email
    if (!isAdmin && !isOwner) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    const reply = await db.contactReply.create({ data: { messageId: id, sender: isAdmin ? 'admin' : 'user', text: response } })
    // When admin replies, set status to 'responded' (triggers the unread badge for the user).
    // When user replies, set status to 'new' (triggers the unread badge for admin, if we add one).
    await db.contactMessage.update({ where: { id }, data: { status: isAdmin ? 'responded' : 'new', response, updatedAt: new Date() } })
    return NextResponse.json({ reply, message: 'Reply sent' })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
