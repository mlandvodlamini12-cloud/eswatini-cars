import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionToken, getSessionCookieName } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    const session = token ? await verifySessionToken(token) : null
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const where = search ? {
      OR: [
        { email: { contains: search.toLowerCase() } },
        { username: { contains: search.toLowerCase() } },
        { phone: { contains: search } },
        { name: { contains: search } },
      ]
    } : {}

    const users = await db.user.findMany({
      where,
      select: { id: true, email: true, username: true, name: true, phone: true, role: true, blocked: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ users })
  } catch (err: any) {
    console.error('[GET /api/admin/users] error:', err)
    return NextResponse.json({ users: [] })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    const session = token ? await verifySessionToken(token) : null
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const body = await req.json()
    const { userId, action } = body
    if (!userId || !action) return NextResponse.json({ error: 'userId and action are required' }, { status: 400 })

    if (action === 'block') {
      await db.user.update({ where: { id: userId }, data: { blocked: true } })
      return NextResponse.json({ success: true, message: 'User blocked' })
    } else if (action === 'unblock') {
      await db.user.update({ where: { id: userId }, data: { blocked: false } })
      return NextResponse.json({ success: true, message: 'User unblocked' })
    } else if (action === 'delete') {
      await db.user.delete({ where: { id: userId } })
      return NextResponse.json({ success: true, message: 'User deleted' })
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    console.error('[PATCH /api/admin/users] error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
