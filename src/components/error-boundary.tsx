'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  errorMessage: string | null
}

/**
 * Top-level error boundary.
 *
 * If a client-side exception is thrown anywhere in the React tree (e.g. a stale
 * Service Worker serves old JS chunks that try to access removed APIs, or a
 * localStorage entry is in an unexpected shape), we show a friendly reload
 * prompt instead of the Next.js default "Application error: a client-side
 * exception has occurred" blank page.
 *
 * The fix in 99% of cases is to hard-reload (bypassing cache), which clears any
 * stale SW state. We surface that as a one-tap button.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMessage: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unknown client-side error',
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log so the next time someone reports "app doesn't open" we can grep
    // the browser console / Sentry / wherever this lands.
    console.error('[ErrorBoundary] Uncaught client error:', error, info)
  }

  hardReload = () => {
    // Tell the browser to bypass its cache on the next fetch, then reload.
    // This also gives the (newly-activated) Service Worker a chance to serve
    // only the freshly-fetched chunks.
    if (typeof window !== 'undefined') {
      try {
        // Clear any localStorage state that may have triggered the error.
        // We are conservative here — we keep `savedCars`, `cachedListings`,
        // and `ec_user` (so users don't lose saved work), but blow away
        // `dismissedBroadcasts`, `recentlyViewed`, and anything that looks
        // like a stale UI flag.
        const SAFE_KEYS = ['savedCars', 'cachedListings', 'ec_user']
        const allKeys = Object.keys(window.localStorage)
        allKeys.forEach((k) => {
          if (!SAFE_KEYS.includes(k)) {
            try { window.localStorage.removeItem(k) } catch {}
          }
        })
      } catch {}

      // location.reload(true) is deprecated; the modern way to bypass cache
      // is to call fetch with cache: 'no-store' then write to location, but
      // that doesn't actually reload the page. Just plain reload — the new
      // SW will take care of cache invalidation.
      window.location.reload()
    }
  }

  clearAllAndReload = () => {
    if (typeof window !== 'undefined') {
      try {
        // Nuclear option: wipe ALL localStorage so we start from a clean slate.
        // The user keeps their server-side data (saved listings are pulled
        // from the API on next load) but loses any cached client state.
        window.localStorage.clear()
        // Also unregister the Service Worker so a fresh one installs.
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((regs) => {
            Promise.all(regs.map((r) => r.unregister())).then(() => {
              window.location.reload()
            })
          })
          return
        }
      } catch {}
      window.location.reload()
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #0a1834 0%, #0f1f4a 100%)',
          color: '#f1f5f9',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
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
              fontSize: 32,
              fontWeight: 700,
              color: '#0a1834',
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
            onClick={this.hardReload}
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
            onClick={this.clearAllAndReload}
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

          {this.state.errorMessage && (
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
                {this.state.errorMessage}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }
}
