// Auth service for the native app.
// Handles login, register, logout, session checking.
// Manages cookies manually (React Native fetch doesn't auto-handle cookies).

import AsyncStorage from '@react-native-async-storage/async-storage'

const API_BASE = 'https://eswatini-cars.vercel.app'
const SESSION_COOKIE_KEY = 'ec_session_cookie'
const USER_KEY = 'ec_user'

export interface User {
  email: string
  name: string
  username?: string
  phone?: string
  role: 'user' | 'admin'
}

// Extract the session cookie from a Response's Set-Cookie header
function extractCookie(response: Response): string | null {
  const setCookie = response.headers.get('set-cookie')
  if (!setCookie) return null
  // The cookie looks like: ec_session=eyJ...; Path=/; HttpOnly; ...
  // We just need the ec_session=VALUE part
  const match = setCookie.match(/ec_session=([^;]+)/)
  return match ? match[1] : null
}

// Get the stored session cookie (for authenticated requests)
export async function getSessionCookie(): Promise<string | null> {
  return await AsyncStorage.getItem(SESSION_COOKIE_KEY)
}

// Get the stored user
export async function getStoredUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

// Store the session cookie + user
async function saveSession(cookie: string, user: User) {
  await AsyncStorage.setItem(SESSION_COOKIE_KEY, cookie)
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
}

// Clear the session (logout)
export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_COOKIE_KEY)
  await AsyncStorage.removeItem(USER_KEY)
}

// Login with email + password
export async function login(email: string, password: string): Promise<{ user: User } | { error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error || 'Login failed' }

    const cookie = extractCookie(res)
    if (!cookie) return { error: 'No session cookie received' }

    const user: User = {
      email: data.user.email,
      name: data.user.name || data.user.email.split('@')[0],
      username: data.user.username,
      phone: data.user.phone,
      role: data.user.role || 'user',
    }
    await saveSession(cookie, user)
    return { user }
  } catch (err: any) {
    return { error: err.message || 'Network error' }
  }
}

// Register a new account
export async function register(params: {
  name: string
  email: string
  phone: string
  password: string
}): Promise<{ user: User } | { error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error || 'Registration failed' }

    const cookie = extractCookie(res)
    if (!cookie) return { error: 'No session cookie received' }

    const user: User = {
      email: data.user.email,
      name: data.user.name || data.user.email.split('@')[0],
      username: data.user.username,
      phone: data.user.phone,
      role: data.user.role || 'user',
    }
    await saveSession(cookie, user)
    return { user }
  } catch (err: any) {
    return { error: err.message || 'Network error' }
  }
}

// Check if we have a valid session (calls /api/auth/me)
export async function checkSession(): Promise<User | null> {
  const cookie = await getSessionCookie()
  if (!cookie) return null

  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Cookie: `ec_session=${cookie}` },
    })
    if (!res.ok) {
      await clearSession()
      return null
    }
    const data = await res.json()
    if (!data.user) {
      await clearSession()
      return null
    }
    const user: User = {
      email: data.user.email,
      name: data.user.name || data.user.email.split('@')[0],
      username: data.user.username,
      phone: data.user.phone,
      role: data.user.role || 'user',
    }
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
    return user
  } catch {
    return null
  }
}

// Logout
export async function logout(): Promise<void> {
  const cookie = await getSessionCookie()
  if (cookie) {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { Cookie: `ec_session=${cookie}` },
      })
    } catch {}
  }
  await clearSession()
}
