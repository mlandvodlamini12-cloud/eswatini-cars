// Session helper — JWT-based sessions stored in httpOnly cookie
import { SignJWT, jwtVerify } from 'jose'

const SESSION_COOKIE = 'ec_session'
// Session duration: 7 days. Previously was 30 days which meant users
// stayed logged in for a month without re-authenticating — a security risk
// if the device is shared or stolen. 7 days is a good balance between
// convenience and security.
const SESSION_DURATION = 7 * 24 * 60 * 60

function getSecret(): Uint8Array {
  // SECURITY: No more fallback secret. If NEXTAUTH_SECRET is not set,
  // we throw an error instead of using a known string that attackers
  // could use to forge JWT tokens.
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET environment variable is not set. JWT tokens cannot be created without it.')
  }
  return new TextEncoder().encode(secret)
}

export interface SessionPayload {
  userId: string
  email: string
  name: string
  role: 'user' | 'admin'
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret())
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as 'user' | 'admin',
    }
  } catch {
    return null
  }
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE
}

export function getSessionDuration(): number {
  return SESSION_DURATION
}
