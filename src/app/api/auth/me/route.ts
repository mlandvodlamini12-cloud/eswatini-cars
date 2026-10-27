import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionToken, getSessionCookieName } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    if (!token) return NextResponse.json({ user: null })
    const payload = await verifySessionToken(token)
    if (!payload) return NextResponse.json({ user: null })
    const user = await db.user.findUnique({ where: { id: payload.userId }, select: { id: true, email: true, username: true, name: true, phone: true, role: true, createdAt: true, blocked: true } })
    if (!user) return NextResponse.json({ user: null })
    if (user.blocked) return NextResponse.json({ user: null })
    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json({ user: null })
  }
}
