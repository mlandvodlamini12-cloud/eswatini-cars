import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSessionToken, getSessionCookieName, getSessionDuration } from '@/lib/session'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

const ADMIN_EMAILS = ['mlandvodlamini12@gmail.com', 'admin@eswatinicars.co.sz']
const ADMIN_PIN = '1374'

export async function POST(req: NextRequest) {
  try {
    // RATE LIMITING: Max 10 login attempts per IP per 15 minutes
    // Prevents brute force attacks on passwords and admin PIN
    const clientIP = getClientIP(req)
    const rateLimit = checkRateLimit(`login:${clientIP}`, 10, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      const minsLeft = Math.ceil((rateLimit.resetAt - Date.now()) / 60000)
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${minsLeft} minutes.` },
        { status: 429 }
      )
    }
    const body = await req.json()
    const { email, password, adminPin } = body
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const normalizedEmail = email.toLowerCase()
    const isAdminEmail = ADMIN_EMAILS.includes(normalizedEmail)

    if (isAdminEmail) {
      if (adminPin !== ADMIN_PIN) return NextResponse.json({ error: 'Wrong Admin PIN' }, { status: 401 })
      let user = await db.user.findUnique({ where: { email: normalizedEmail } })
      if (!user) {
        const passwordHash = bcrypt.hashSync(`admin-pin-${Date.now()}`, 10)
        user = await db.user.create({ data: { email: normalizedEmail, username: normalizedEmail.split('@')[0], name: normalizedEmail.split('@')[0], passwordHash, role: 'admin' } })
      } else if (user.role !== 'admin') {
        user = await db.user.update({ where: { id: user.id }, data: { role: 'admin' } })
      }
    } else {
      if (!password || password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
      const user = await db.user.findUnique({ where: { email: normalizedEmail } })
      if (!user || !user.passwordHash) {
        if (user && !user.passwordHash) return NextResponse.json({ error: 'This account uses Google Sign-In. Please use "Continue with Google".' }, { status: 401 })
        return NextResponse.json({ error: 'Email not found. Please register first.' }, { status: 404 })
      }
      if (user.blocked) return NextResponse.json({ error: 'Your account has been blocked. Contact admin.' }, { status: 403 })
      if (!bcrypt.compareSync(password, user.passwordHash)) return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
    }

    const finalUser = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (!finalUser) return NextResponse.json({ error: 'User not found' }, { status: 500 })

    const token = await createSessionToken({ userId: finalUser.id, email: finalUser.email, name: finalUser.name, role: finalUser.role as 'user' | 'admin' })
    const response = NextResponse.json({ user: { id: finalUser.id, email: finalUser.email, username: finalUser.username, name: finalUser.name, phone: finalUser.phone, role: finalUser.role }, message: 'Login successful' })
    response.cookies.set(getSessionCookieName(), token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: getSessionDuration(), path: '/' })
    return response
  } catch (err: any) {
    console.error('[login] error:', err)
    return NextResponse.json({ error: 'Login failed', message: err?.message || String(err) }, { status: 500 })
  }
}
