import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ESWATINI CARS — Managed Vehicle Marketplace",
  description: "Eswatini's #1 managed vehicle marketplace. Safe, verified, broker-managed viewings. No scammers. Buy and sell cars, bakkies, vans, heavy vehicles, bikes, and parts across all four regions of Eswatini.",
  keywords: ["Eswatini cars", "cars for sale Eswatini", "vehicle marketplace Swaziland", "buy car Mbabane", "Manzini cars", "bakkies Eswatini", "car broker"],
  authors: [{ name: "ESWATINI CARS" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/icons/favicon.ico"],
  },
  appleWebApp: {
    capable: true,
    title: "ESWATINI CARS",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    title: "ESWATINI CARS — Managed Vehicle Marketplace",
    description: "Safe, verified, broker-managed vehicle viewings across Eswatini. No scammers. Free to list.",
    siteName: "ESWATINI CARS",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ESWATINI CARS",
    description: "Eswatini's #1 managed vehicle marketplace. Safe, verified, broker-managed viewings.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a1834" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1834" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA: Windows tile color */}
        <meta name="msapplication-TileColor" content="#0a1834" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* Mobile optimizations */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ESWATINI CARS" />
        {/*
          INLINE LOADING SCREEN — eliminates the white flash during page load.
          This CSS + HTML is inlined directly in the <head> so it runs IMMEDIATELY
          when the browser parses the HTML, BEFORE any external CSS or JS bundles
          are downloaded/parsed. Without this, the browser shows a white screen
          (default body background) until the Tailwind CSS bundle loads and
          applies the `bg-background` class.

          How it works:
          1. The inline <style> sets the body background to navy (#0a1834) immediately
          2. The inline <div id="initial-loader"> shows a branded spinner
          3. When React hydrates and renders the actual app, this div gets replaced
             naturally (React replaces the body content with the real app)
          4. The loader CSS is scoped to #initial-loader so it doesn't conflict
             with Tailwind classes
        */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Immediately set the body background to navy so there's no white flash.
             This runs before Tailwind CSS loads, so the user sees navy from the
             very first frame instead of white. */
          html, body {
            background-color: #0a1834 !important;
            margin: 0;
            padding: 0;
            min-height: 100vh;
          }
          /* The branded loading screen — shows a centered logo + spinner.
             This div is inside <body> and gets replaced when React mounts. */
          #initial-loader {
            position: fixed;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(180deg, #0a1834 0%, #0f1f4a 100%);
            color: #f1f5f9;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
            z-index: 9999;
          }
          #initial-loader .loader-logo {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 700;
            color: #0a1834;
            letter-spacing: -0.04em;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(14, 165, 233, 0.3);
          }
          #initial-loader .loader-text {
            font-size: 14px;
            font-weight: 600;
            color: #f1f5f9;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          }
          #initial-loader .loader-subtext {
            font-size: 11px;
            color: #94a3b8;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }
          #initial-loader .loader-spinner {
            margin-top: 24px;
            width: 32px;
            height: 32px;
            border: 3px solid rgba(56, 189, 248, 0.2);
            border-top-color: #38bdf8;
            border-radius: 50%;
            animation: loader-spin 0.8s linear infinite;
          }
          @keyframes loader-spin {
            to { transform: rotate(360deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            #initial-loader .loader-spinner { animation: none; }
          }
        `}} />
        {/* Register service worker + remove initial loader.
            Both scripts are in the <head> because Next.js executes inline scripts
            in the <head> reliably. Scripts in the <body> using dangerouslySetInnerHTML
            can get serialized as RSC payload data instead of executing. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Register service worker
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('PWA SW registered:', registration.scope);
                  }).catch(function(err) {
                    console.log('PWA SW registration failed:', err);
                  });
                });
              }

              // Remove the initial loading screen once the page is fully loaded.
              // The loader div is in <body> (rendered before React hydrates) and
              // shows a branded spinner. We remove it after 'load' fires + 300ms
              // delay (gives React time to hydrate and render the actual app).
              // Fail-safe: remove after 5s regardless, so users aren't stuck.
              (function() {
                var loader = document.getElementById('initial-loader');
                if (!loader) return;

                function removeLoader() {
                  var l = document.getElementById('initial-loader');
                  if (l && l.parentNode) {
                    l.style.transition = 'opacity 0.3s ease-out';
                    l.style.opacity = '0';
                    setTimeout(function() {
                      if (l.parentNode) l.parentNode.removeChild(l);
                    }, 300);
                  }
                }

                window.addEventListener('load', function() {
                  setTimeout(removeLoader, 300);
                });

                // Fail-safe: remove after 5s no matter what
                setTimeout(removeLoader, 5000);

                // If DOM is already complete, remove after short delay
                if (document.readyState === 'complete') {
                  setTimeout(removeLoader, 300);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/*
          Inline loading screen — this HTML renders IMMEDIATELY when the browser
          parses the body, before React hydrates. When React mounts, it renders
          the app content (which is also in the SSR HTML, behind the loader).
          The script below removes the loader once the page is fully loaded
          so the user sees the actual app.
        */}
        <div id="initial-loader">
          <div class="loader-logo">EC</div>
          <div class="loader-text">ESWATINI CARS</div>
          <div class="loader-subtext">Managed Vehicle Marketplace</div>
          <div class="loader-spinner"></div>
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
