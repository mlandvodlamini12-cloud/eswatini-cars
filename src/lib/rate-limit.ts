// Simple in-memory rate limiter for API routes.
// Prevents brute force attacks on login, register, and OTP endpoints.
// In production, this should use Redis or a database, but for Vercel
// serverless functions, in-memory works for basic protection (each
// function instance has its own memory, so this is a "best effort"
// limiter — not perfect but better than nothing).

const attempts = new Map<string, { count: number; resetAt: number }>()

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check if an IP/identifier has exceeded the rate limit.
 * @param identifier - IP address or email
 * @param maxAttempts - Max attempts allowed in the window
 * @param windowMs - Time window in milliseconds (default: 15 min)
 * @returns { allowed, remaining, resetAt }
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 10,
  windowMs: number = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now()
  const key = identifier

  const existing = attempts.get(key)

  if (!existing || existing.resetAt < now) {
    // No existing record or window expired — start fresh
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs }
  }

  existing.count++

  if (existing.count > maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  return { allowed: true, remaining: maxAttempts - existing.count, resetAt: existing.resetAt }
}

/**
 * Get client IP from request headers.
 * Vercel puts the real client IP in x-forwarded-for.
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIP = req.headers.get('x-real-ip')
  if (realIP) return realIP
  return 'unknown'
}
