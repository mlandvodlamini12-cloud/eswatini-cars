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

/**
 * Normalize a phone number to E.164 format (e.g. +26876295648).
 *
 * Firebase Phone Auth requires the phone number to be in strict E.164 format:
 *   - Starts with +
 *   - Country code
 *   - Subscriber number
 *   - NO spaces, dashes, parentheses, or other separators
 *
 * Eswatini numbers are +268 followed by 8 digits (e.g. +268 7629 5648 → +26876295648).
 * This function strips all non-digit characters and ensures the + prefix is present.
 *
 * If the user typed "7629 5648" (no country code), we assume Eswatini (+268) and
 * prepend it. If they typed "+268 7629 5648" we just strip the spaces.
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') return ''
  let cleaned = phone.trim()
  // Strip all whitespace, dashes, parentheses, dots
  cleaned = cleaned.replace(/[\s\-().]/g, '')
  // If it doesn't start with +, prepend the Eswatini country code
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('268')) {
      cleaned = '+' + cleaned
    } else if (cleaned.startsWith('00')) {
      // Some users type 00268... instead of +268...
      cleaned = '+' + cleaned.slice(2)
    } else if (cleaned.length === 8) {
      // Bare Eswatini number like 76295648 → +26876295648
      cleaned = '+268' + cleaned
    } else if (cleaned.startsWith('0')) {
      // Local format like 0762956488 → strip leading 0, add +268
      cleaned = '+268' + cleaned.slice(1)
    } else {
      cleaned = '+' + cleaned
    }
  }
  return cleaned
}

/**
 * Send an OTP to the user's phone via Firebase phone auth.
 *
 * Uses an invisible reCAPTCHA to verify the request is from a real user (not a bot).
 * The reCAPTCHA renders inside the #recaptcha-container div (which must exist in the DOM).
 *
 * @param phoneNumber - Phone number in any reasonable format (e.g. "+268 7629 5648", "76295648", "0762956488")
 * @returns { confirmationResult } on success, or { error } on failure
 */
export async function sendPhoneOTP(phoneNumber: string): Promise<{ confirmationResult: any } | { error: string }> {
  try {
    // Normalize the phone number to E.164 format before sending to Firebase.
    // Without this, Firebase throws "auth/argument-error" if the number has
    // spaces, dashes, or is missing the country code.
    const normalizedPhone = normalizePhoneNumber(phoneNumber)
    if (!normalizedPhone || normalizedPhone.length < 6) {
      return { error: 'Please enter a valid phone number (e.g. +268 7629 5648)' }
    }

    const auth = await getFirebaseAuth()
    if (!auth) return { error: 'Firebase not initialized' }
    const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth')

    // Create an invisible reCAPTCHA verifier. Firebase uses this to confirm
    // the request is from a real user, not a bot trying to spam SMS.
    // The 'recaptcha-container' div must exist in the DOM (it's rendered in the
    // register dialog).
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      // 'callback' fires when reCAPTCHA verification succeeds — we don't need
      // to do anything here because signInWithPhoneNumber will proceed
      // automatically once verification passes.
      callback: () => {},
      // 'error-callback' fires if reCAPTCHA itself fails (rare).
      'error-callback': () => {},
    })

    const confirmationResult = await signInWithPhoneNumber(auth, normalizedPhone, recaptchaVerifier)
    return { confirmationResult }
  } catch (err: any) {
    // Extract the most useful error message from Firebase's error object.
    // Firebase errors often have err.code (e.g. "auth/argument-error"),
    // err.message (a long string), and sometimes err.customData.message.
    // We want the shortest human-readable message.
    const errorCode = err?.code || ''
    const errorMessage = err?.message || String(err) || 'Failed to send OTP'

    // Map common Firebase phone-auth error codes to user-friendly messages.
    const friendlyErrors: Record<string, string> = {
      'auth/argument-error': 'Invalid phone number format. Please enter your full phone number including country code (e.g. +268 7629 5648).',
      'auth/operation-not-allowed': 'Phone authentication requires the Firebase Blaze (pay-as-you-go) plan. Even though Phone Auth is enabled in the Firebase Console, the free Spark plan blocks actual SMS sending. The admin needs to upgrade to Blaze (still free for the first 10 SMS/day — you only pay if you exceed).',
      'auth/quota-exceeded': 'Daily SMS quota exceeded (10/day on free plan). Please try again tomorrow or contact admin to upgrade.',
      'auth/invalid-phone-number': 'The phone number is invalid. Please check the format (e.g. +268 7629 5648).',
      'auth/too-many-requests': 'Too many OTP requests. Please wait a few minutes before trying again.',
      'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please refresh the page and try again.',
      'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
      'auth/app-not-authorized': 'This app is not authorized to use Firebase Authentication. Please verify the Firebase config in the console.',
    }

    const friendlyMessage = friendlyErrors[errorCode] || errorMessage
    return { error: friendlyMessage }
  }
}

export async function verifyPhoneOTP(confirmationResult: any, code: string): Promise<PhoneVerificationResult> {
  try {
    await confirmationResult.confirm(code)
    return { verified: true }
  } catch (err: any) {
    const errorCode = err?.code || ''
    const friendlyErrors: Record<string, string> = {
      'auth/invalid-verification-code': 'Wrong code. Please check the 6-digit code we sent to your phone and try again.',
      'auth/code-expired': 'The verification code has expired. Please request a new code.',
      'auth/missing-verification-code': 'Please enter the 6-digit code we sent to your phone.',
    }
    return { verified: false, error: friendlyErrors[errorCode] || err?.message || 'Invalid code' }
  }
}

export interface GoogleSignInResult { idToken?: string; email?: string; name?: string; error?: string }

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  try {
    const auth = await getFirebaseAuth()
    if (!auth) return { error: 'Firebase not initialized' }
    const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import('firebase/auth')
    const provider = new GoogleAuthProvider()
    provider.addScope('email'); provider.addScope('profile')
    provider.setCustomParameters({ prompt: 'select_account' })
    try {
      const result = await signInWithPopup(auth, provider)
      if (result?.user) { const idToken = await result.user.getIdToken(); return { idToken, email: result.user.email || undefined, name: result.user.displayName || undefined } }
    } catch (e: any) {
      if (['auth/popup-blocked','auth/popup-closed-by-user','auth/cancelled-popup-request','auth/operation-not-supported-in-this-environment'].includes(e?.code)) { await signInWithRedirect(auth, provider); return { error: '__redirect_in_progress__' } }
      throw e
    }
    return { error: 'No result from Google Sign-In' }
  } catch (err: any) {
    const f: Record<string,string> = { 'auth/popup-closed-by-user':'Sign-in cancelled. Please try again.','auth/operation-not-allowed':'Google Sign-In not enabled in Firebase Console.','auth/unauthorized-domain':'Domain not authorized in Firebase.' }
    return { error: f[err?.code] || err?.message || 'Google Sign-In failed' }
  }
}

export async function checkGoogleRedirectResult(): Promise<GoogleSignInResult> {
  try {
    const auth = await getFirebaseAuth()
    if (!auth) return { error: 'Firebase not initialized' }
    const { getRedirectResult } = await import('firebase/auth')
    const result = await getRedirectResult(auth)
    if (!result?.user) return { error: '__no_pending_redirect__' }
    const idToken = await result.user.getIdToken()
    return { idToken, email: result.user.email || undefined, name: result.user.displayName || undefined }
  } catch (err: any) { return { error: err?.message || 'Failed to complete Google Sign-In' } }
}
