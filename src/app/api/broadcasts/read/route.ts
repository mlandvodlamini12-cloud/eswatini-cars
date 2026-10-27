import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionToken, getSessionCookieName } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const session = await verifySessionToken(token)
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    const body = await req.json()
    const { broadcastId } = body
    if (!broadcastId) return NextResponse.json({ error: 'broadcastId required' }, { status: 400 })
    await db.userRead.upsert({ where: { userId_broadcastId: { userId: session.userId, broadcastId } }, create: { userId: session.userId, broadcastId }, update: { readAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
