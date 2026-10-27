'use client'

// Next.js route-level error boundary.
//
// Catches any uncaught error thrown by the homepage (or any route under /app)
// during client-side rendering, and surfaces a friendly reload UI instead of
// the default "Application error: a client-side exception has occurred" blank
// white page that has been blanking the user's screen.
//
// See: https://nextjs.org/docs/app/api-reference/file-conventions/error

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface the error to the browser console so the user can paste it back
    // to us when they report "the app still doesn't open".
    console.error('[AppError] Uncaught client error:', error)
  }, [error])

  const hardReload = () => {
    if (typeof window === 'undefined') return
    // Clear any localStorage state that may have triggered the error.
    // We keep `savedCars`, `cachedListings`, and `ec_user` so users don't
    // lose saved work, but blow away everything else that might be stale.
    const SAFE_KEYS = ['savedCars', 'cachedListings', 'ec_user']
    try {
      Object.keys(window.localStorage).forEach((k) => {
        if (!SAFE_KEYS.includes(k)) {
          try { window.localStorage.removeItem(k) } catch {}
        }
      })
    } catch {}
    // Call reset() first so React clears the error state, then force-reload.
    try { reset() } catch {}
    window.location.reload()
  }

  const clearAllAndReload = () => {
    if (typeof window === 'undefined') return
    try {
      // Nuclear option: wipe ALL localStorage + unregister the Service Worker
      // so a fresh one installs on next load. Server-side data (saved listings,
      // account) is preserved — pulled back from the API on next load.
      window.localStorage.clear()
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          Promise.all(regs.map((r) => r.unregister()))
            .then(() => window.location.reload())
            .catch(() => window.location.reload())
        })
        return
      }
    } catch {}
    window.location.reload()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #0a1834 0%, #0f1f4a 100%)',
        color: '#f1f5f9',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        padding: '1.5rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 480, width: '100%' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            fontSize: 28,
            fontWeight: 700,
            color: '#0a1834',
            letterSpacing: '-0.04em',
          }}
        >
          EC
        </div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontSize: '0.95rem',
            color: '#cbd5e1',
            marginBottom: '1.5rem',
            lineHeight: 1.55,
          }}
        >
          Eswatini Cars hit a snag while loading. This is usually caused by an
          outdated cached version of the app on your device. Try the button
          below — it will clear the stale cache and reload the latest version.
        </p>

        <button
          type="button"
          onClick={hardReload}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            background: '#0ea5e9',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '0.75rem',
          }}
        >
          Reload app
        </button>

        <button
          type="button"
          onClick={clearAllAndReload}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'transparent',
            color: '#94a3b8',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Still not working? Reset app data
        </button>

        <details
          style={{
            marginTop: '1.25rem',
            textAlign: 'left',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <summary style={{ cursor: 'pointer' }}>Technical details</summary>
          <pre
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '0.375rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            {error?.message || 'Unknown error'}
            {error?.digest ? `\nDigest: ${error.digest}` : ''}
          </pre>
        </details>
      </div>
    </div>
  )
}
