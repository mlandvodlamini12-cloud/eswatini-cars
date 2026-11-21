// Initial loading screen controller + auto-update banner.
// This script is loaded synchronously in the <head> BEFORE any other JS.
//
// It does three things:
// 1. Registers the service worker for PWA offline support
// 2. Listens for SW updates and shows a non-intrusive "Update available"
//    banner when a new version is detected. User taps "Update now" →
//    page reloads with fresh code. No manual cache clearing required.
// 3. Removes the #initial-loader div after the page fully loads
//    (the loader shows a branded spinner while the React app hydrates)
//
// AUTO-UPDATE FLOW:
//   User opens app → old SW controls page → browser checks for SW update
//   → finds new SW (v22) → downloads + installs + activates (skipWaiting)
//   → controllerchange fires → banner appears → user taps "Update now"
//   → page reloads → new SW serves fresh code → user sees fixed app.
//
// The banner is non-intrusive: small bar at the bottom of the screen,
// dismissible, doesn't block the UI. If the user dismisses it, they'll
// see it again next time they open the app (cold start).

(function () {
  // ============================================================
  // 1. SERVICE WORKER REGISTRATION + AUTO-UPDATE BANNER
  // ============================================================
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').then(function (registration) {
        console.log('PWA SW registered:', registration.scope)

        // CASE A: A new SW was already waiting when the page loaded
        // (happens when user opens the app and a new SW was downloaded
        // in a previous visit but hasn't activated yet)
        if (registration.waiting) {
          showUpdateBanner()
        }

        // CASE B: Listen for a new SW being installed
        registration.addEventListener('updatefound', function () {
          var installingWorker = registration.installing
          if (installingWorker) {
            installingWorker.addEventListener('statechange', function () {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New SW is installed. Because our SW calls skipWaiting(),
                // it will activate immediately → controllerchange will fire.
                // Show the banner now so user knows an update is ready.
                showUpdateBanner()
              }
            })
          }
        })

        // Periodically check for updates (every 60 minutes)
        // The browser only checks for SW updates on navigation, so if a
        // user leaves the app open for hours, they won't get the update
        // until they navigate. This interval forces a check.
        setInterval(function () {
          registration.update().catch(function () {})
        }, 60 * 60 * 1000)
      }).catch(function (err) {
        console.log('PWA SW registration failed:', err)
      })
    })

    // CASE C: The controller changed (new SW just took over).
    // If this isn't the very first activation, reload the page so the
    // user gets the new code. We use a flag to skip the first activation
    // (which happens when the SW registers for the first time).
    var refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (refreshing) return
      refreshing = true
      // Don't auto-reload — let the user tap the banner.
      // The banner is already shown by CASE A or CASE B above.
      // If we reload here, we'd interrupt the user mid-action.
    })
  }

  // ============================================================
  // 2. UPDATE BANNER UI
  // ============================================================
  // Shows a non-intrusive banner at the bottom of the screen.
  // User can tap "Update now" to reload, or "Later" to dismiss.
  // If dismissed, it'll show again on next app open (cold start).
  function showUpdateBanner() {
    // Don't show twice
    if (document.getElementById('sw-update-banner')) return

    // Wait for DOM to be ready
    function show() {
      if (document.getElementById('sw-update-banner')) return

      var banner = document.createElement('div')
      banner.id = 'sw-update-banner'
      banner.style.cssText = [
        'position: fixed',
        'bottom: 0',
        'left: 0',
        'right: 0',
        'background: #0a1834',
        'color: white',
        'padding: 14px 16px',
        'display: flex',
        'align-items: center',
        'justify-content: space-between',
        'gap: 12px',
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        'font-size: 14px',
        'z-index: 999999',
        'box-shadow: 0 -4px 20px rgba(0,0,0,0.3)',
        'border-top: 2px solid #38bdf8',
        'animation: slideUp 0.3s ease-out',
      ].join('; ')

      banner.innerHTML = '' +
        '<div style="flex: 1; min-width: 0;">' +
          '<div style="font-weight: 600; font-size: 14px; color: #38bdf8;">🔄 Update available</div>' +
          '<div style="font-size: 12px; color: #cbd5e1; margin-top: 2px;">A new version of the app is ready.</div>' +
        '</div>' +
        '<button id="sw-update-later" style="' +
          'background: transparent; color: #94a3b8; border: none; padding: 8px 12px; ' +
          'font-size: 13px; font-weight: 500; cursor: pointer; border-radius: 6px;' +
        '">Later</button>' +
        '<button id="sw-update-now" style="' +
          'background: #38bdf8; color: #0a1834; border: none; padding: 8px 16px; ' +
          'font-size: 13px; font-weight: 700; cursor: pointer; border-radius: 6px;' +
        '">Update now</button>'

      // Add slide-up animation
      var style = document.createElement('style')
      style.textContent = '@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }'
      document.head.appendChild(style)

      document.body.appendChild(banner)

      // Wire up buttons
      document.getElementById('sw-update-now').addEventListener('click', function () {
        banner.remove()
        window.location.reload()
      })
      document.getElementById('sw-update-later').addEventListener('click', function () {
        banner.remove()
        // User will see it again on next cold start
      })
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', show)
    } else {
      show()
    }
  }

  // ============================================================
  // 3. INITIAL LOADING SCREEN REMOVAL
  // ============================================================
  function removeLoader() {
    var l = document.getElementById('initial-loader')
    if (l && l.parentNode) {
      l.style.transition = 'opacity 0.3s ease-out'
      l.style.opacity = '0'
      setTimeout(function () {
        if (l.parentNode) l.parentNode.removeChild(l)
      }, 300)
    }
  }

  // Remove 300ms after 'load' fires (gives React time to hydrate)
  window.addEventListener('load', function () {
    setTimeout(removeLoader, 300)
  })

  // Fail-safe: remove after 5s no matter what
  setTimeout(removeLoader, 5000)

  // If DOM is already complete, remove after short delay
  if (document.readyState === 'complete') {
    setTimeout(removeLoader, 300)
  }
})()
