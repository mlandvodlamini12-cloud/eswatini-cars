// Initial loading screen controller.
// This script is loaded synchronously in the <head> BEFORE any other JS.
// It does two things:
//
// 1. Registers the service worker for PWA offline support
// 2. Removes the #initial-loader div after the page fully loads
//    (the loader shows a branded spinner while the React app hydrates)
//
// The loader div is rendered in the SSR HTML (inside <body>) and shows
// immediately when the browser parses the HTML — BEFORE any external CSS
// or JS bundles load. This eliminates the white flash that would otherwise
// appear while the Tailwind CSS bundle downloads.
//
// We remove the loader 300ms after the 'load' event fires, which gives
// React time to hydrate and render the actual app content behind the
// loader. The loader fades out smoothly (opacity transition).
//
// Fail-safe: if 'load' doesn't fire within 5 seconds (e.g. a JS bundle
// fails to download), we remove the loader anyway so users aren't stuck
// on a loading screen forever.

(function () {
  // 1. Register service worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').then(function (registration) {
        console.log('PWA SW registered:', registration.scope)
      }).catch(function (err) {
        console.log('PWA SW registration failed:', err)
      })
    })
  }

  // 2. Remove the initial loading screen after the page loads
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
