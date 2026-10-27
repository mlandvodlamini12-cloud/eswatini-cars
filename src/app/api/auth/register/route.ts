import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSessionToken, getSessionCookieName, getSessionDuration } from '@/lib/session'

const ADMIN_EMAILS = ['mlandvodlamini12@gmail.com', 'admin@eswatinicars.co.sz']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, phone, username, phoneVerified } = body
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!username) return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (!phone) return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    if (!password || password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return NextResponse.json({ error: 'Username must be 3-20 characters (letters, numbers, underscores only)' }, { status: 400 })

    const existingEmail = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existingEmail) return NextResponse.json({ error: 'Email already registered. Try logging in instead.' }, { status: 409 })
    const existingUsername = await db.user.findUnique({ where: { username: username.toLowerCase() } })
    if (existingUsername) return NextResponse.json({ error: 'Username already taken. Please choose another.' }, { status: 409 })

    const passwordHash = bcrypt.hashSync(password, 10)
    const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user'
    const user = await db.user.create({ data: { email: email.toLowerCase(), username: username.toLowerCase(), name, phone, phoneVerified: phoneVerified || false, passwordHash, role } })

    const token = await createSessionToken({ userId: user.id, email: user.email, name: user.name, role: role as 'user' | 'admin' })
    const response = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username, name: user.name, phone: user.phone, role: user.role }, message: 'Account created successfully' })
    response.cookies.set(getSessionCookieName(), token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: getSessionDuration(), path: '/' })
    return response
  } catch (err: any) {
    console.error('[register] error:', err)
    return NextResponse.json({ error: 'Registration failed', message: err?.message || String(err) }, { status: 500 })
  }
}
