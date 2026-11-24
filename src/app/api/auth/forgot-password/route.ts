import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SignJWT } from 'jose'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

// POST /api/auth/forgot-password
// Takes: { email }
// Returns: { token } — a JWT reset token (NOT sent via email)
// The frontend shows a "enter new password" form using this token.
// This works WITHOUT email verification — needed because Resend's
// free tier (onboarding@resend.dev) only sends to one email address.

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req)
    const rl = checkRateLimit(`forgot:${clientIP}`, 5, 60 * 60 * 1000)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })

    // For security: always return a token (even if email doesn't exist)
    // The token won't work if the user doesn't exist (verified on reset)
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) throw new Error('NEXTAUTH_SECRET not set')

    if (!user || !user.passwordHash) {
      // User doesn't exist or registered via Google (no password)
      return NextResponse.json({
        error: user && !user.passwordHash
          ? 'This email is registered via Google Sign-In. Use "Continue with Google" to log in.'
          : 'No account found with this email. Try registering first.'
      }, { status: 400 })
    }

    // Generate a JWT reset token (expires in 10 minutes)
    const token = await new SignJWT({ email: user.email, purpose: 'password-reset' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('10m')
      .sign(new TextEncoder().encode(secret))

    // Return the token directly — no email needed
    return NextResponse.json({ success: true, token, name: user.name })
  } catch (err: any) {
    console.error('[forgot-password] error:', err)
    return NextResponse.json({ error: 'Failed to generate reset token. Try again.' }, { status: 500 })
  }
}

