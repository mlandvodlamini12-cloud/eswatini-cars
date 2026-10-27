import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionToken, getSessionCookieName } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    const session = token ? await verifySessionToken(token) : null
    const broadcasts = await db.broadcast.findMany({ where: { status: 'active', OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, orderBy: { createdAt: 'desc' }, take: 20 })
    let filtered = broadcasts
    if (!session) filtered = broadcasts.filter(b => b.audience === 'all')
    else if (session.role === 'user') filtered = broadcasts.filter(b => b.audience === 'all' || b.audience === 'registered')
    if (session) {
      const readRecords = await db.userRead.findMany({ where: { userId: session.userId }, select: { broadcastId: true } })
      const readIds = new Set(readRecords.map(r => r.broadcastId))
      return NextResponse.json({ broadcasts: filtered.map(b => ({ id: b.id, title: b.title, message: b.message, audience: b.audience, createdAt: b.createdAt, read: readIds.has(b.id) })) })
    }
    return NextResponse.json({ broadcasts: filtered.map(b => ({ id: b.id, title: b.title, message: b.message, audience: b.audience, createdAt: b.createdAt, read: false })) })
  } catch (err: any) {
    return NextResponse.json({ broadcasts: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const session = await verifySessionToken(token)
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    const body = await req.json()
    const { title, message, audience = 'all' } = body
    if (!title || !message) return NextResponse.json({ error: 'Title and message required' }, { status: 400 })
    const broadcast = await db.broadcast.create({ data: { title, message, audience, status: 'active' } })
    return NextResponse.json({ broadcast })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
