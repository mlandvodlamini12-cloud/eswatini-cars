// Firebase config for phone verification
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: "AIzaSyC7GBUpSvZ7L9oI76MGhp8Q3xTgpEeITFQ",
  authDomain: "eswatini-cars.firebaseapp.com",
  projectId: "eswatini-cars",
  storageBucket: "eswatini-cars.firebasestorage.app",
  messagingSenderId: "65362007386",
  appId: "1:65362007386:web:d1ea2644a20b1466264f63",
  measurementId: "G-M7XXC33QMW"
}

let app: ReturnType<typeof initializeApp> | null = null

export function getFirebaseApp() {
  if (typeof window === 'undefined') return null
  if (!app) app = initializeApp(firebaseConfig)
  return app
}

export async function getFirebaseAuth() {
  if (typeof window === 'undefined') return null
  const fbApp = getFirebaseApp()
  if (!fbApp) return null
  const { getAuth } = await import('firebase/auth')
  return getAuth(fbApp)
}

export interface PhoneVerificationResult {
  verified: boolean
  error?: string
}

export async function sendPhoneOTP(phoneNumber: string): Promise<{ confirmationResult: any } | { error: string }> {
  try {
    const auth = await getFirebaseAuth()
    if (!auth) return { error: 'Firebase not initialized' }
    const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth')
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
    return { confirmationResult }
  } catch (err: any) {
    return { error: err?.message || 'Failed to send OTP' }
  }
}

export async function verifyPhoneOTP(confirmationResult: any, code: string): Promise<PhoneVerificationResult> {
  try {
    await confirmationResult.confirm(code)
    return { verified: true }
  } catch (err: any) {
    return { verified: false, error: err?.message || 'Invalid code' }
  }
}
