import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionToken, getSessionCookieName } from '@/lib/session'

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const session = await verifySessionToken(token)
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    if (session.role === 'admin') return NextResponse.json({ error: 'Admin accounts cannot be self-deleted' }, { status: 403 })

    await db.user.delete({ where: { id: session.userId } })

    const response = NextResponse.json({ success: true, message: 'Account deleted' })
    response.cookies.set(getSessionCookieName(), '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' })
    return response
  } catch (err: any) {
    console.error('[delete-account] error:', err)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
