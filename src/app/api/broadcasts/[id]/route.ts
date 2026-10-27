import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionToken, getSessionCookieName } from '@/lib/session'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const session = await verifySessionToken(token)
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    const { id } = await params
    await db.broadcast.update({ where: { id }, data: { status: 'archived' } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
