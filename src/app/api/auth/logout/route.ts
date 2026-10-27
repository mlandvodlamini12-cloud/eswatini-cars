import { NextResponse } from 'next/server'
import { getSessionCookieName } from '@/lib/session'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' })
  response.cookies.set(getSessionCookieName(), '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' })
  return response
}
