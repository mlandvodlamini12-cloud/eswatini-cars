import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { jwtVerify } from 'jose'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

// POST /api/auth/reset-password
// Takes: { token, newPassword }
// Verifies the JWT token, updates the password

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req)
    const rl = checkRateLimit(`reset:${clientIP}`, 10, 60 * 60 * 1000)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const { token, newPassword } = await req.json()
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Verify the JWT token
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) throw new Error('NEXTAUTH_SECRET not set')

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
      if (payload.purpose !== 'password-reset') {
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
      }
      const email = payload.email as string
      if (!email) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
      }

      // Find the user
      const user = await db.user.findUnique({ where: { email } })
      if (!user || !user.passwordHash) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
      }

      // Update the password
      const passwordHash = bcrypt.hashSync(newPassword, 10)
      await db.user.update({ where: { id: user.id }, data: { passwordHash } })

      return NextResponse.json({ success: true, message: 'Password updated successfully. You can now log in with your new password.' })
    } catch (jwtErr) {
      return NextResponse.json({ error: 'Reset link expired or invalid. Request a new one.' }, { status: 400 })
    }
  } catch (err: any) {
    console.error('[reset-password] error:', err)
    return NextResponse.json({ error: 'Failed to reset password. Try again.' }, { status: 500 })
  }
}
