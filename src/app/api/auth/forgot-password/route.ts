import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { SignJWT } from 'jose'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

// POST /api/auth/forgot-password
// Takes: { email }
// Sends a password reset email with a link containing a JWT token
// The token expires in 1 hour

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

    // For security: always return success, even if email doesn't exist
    // (prevents attackers from enumerating valid emails)
    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: true, message: 'If the email exists, a reset link has been sent.' })
    }

    // Generate a JWT reset token (expires in 1 hour)
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) throw new Error('NEXTAUTH_SECRET not set')

    const token = await new SignJWT({ email: user.email, purpose: 'password-reset' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(secret))

    // Build the reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'https://eswatini-cars.vercel.app'
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    // Send the email
    await sendEmail(
      user.email,
      'Password Reset — Eswatini Cars',
      `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0a1834;">Password Reset</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset for your Eswatini Cars account.</p>
          <p>Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #38bdf8; color: #0a1834; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">Reset Password</a>
          <p style="color: #64748b; font-size: 14px;">This link expires in 1 hour.</p>
          <p style="color: #64748b; font-size: 14px;">If you didn't request this, ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 12px;">Eswatini Cars — Managed Vehicle Marketplace</p>
        </div>
      `
    )

    return NextResponse.json({ success: true, message: 'If the email exists, a reset link has been sent.' })
  } catch (err: any) {
    console.error('[forgot-password] error:', err)
    return NextResponse.json({ error: 'Failed to send reset email. Try again.' }, { status: 500 })
  }
}
