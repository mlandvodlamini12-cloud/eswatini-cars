import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

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
  description: "Eswatini's #1 managed vehicle marketplace. Safe, verified, supervised viewings. No scammers. Buy and sell cars, bakkies, vans, heavy vehicles, bikes, and parts across all four regions of Eswatini.",
  keywords: ["Eswatini cars", "cars for sale Eswatini", "vehicle marketplace Swaziland", "buy car Mbabane", "Manzini cars", "bakkies Eswatini", "car marketplace"],
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
    description: "Safe, verified, supervised vehicle viewings across Eswatini. No scammers. Free to list.",
    siteName: "ESWATINI CARS",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ESWATINI CARS",
    description: "Eswatini's #1 managed vehicle marketplace. Safe, verified, supervised viewings.",
  },
};

export const viewport: Viewport = {
  // colorScheme: 'dark' tells the browser to render the page in dark mode
  // from the very first frame — BEFORE any CSS loads. This is what eliminates
  // the white flash during page load. The browser uses a dark background for
  // the initial paint instead of its default white.
  colorScheme: 'dark',
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a1834" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1834" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: '#0a1834' }}>
      <head>
        {/*
          COLOR-SCHEME META TAG — THE KEY to eliminating the white flash.
          This MUST be the very first element in <head>. It tells the browser
          "this page is dark mode" BEFORE any CSS is parsed. Without it, the
          browser defaults to light mode (white background) for the initial
          paint — that's the fraction-of-a-second white flash the user sees.

          With this tag, the browser uses a dark background for the initial
          paint (before CSS loads), matching our navy theme seamlessly.
        */}
        <meta name="color-scheme" content="dark" />
        {/* PWA: Windows tile color */}
        <meta name="msapplication-TileColor" content="#0a1834" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* Mobile optimizations */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ESWATINI CARS" />
        {/*
          INLINE LOADING SCREEN — matches the native Android splash EXACTLY.
          Shows a centered app-icon.png on solid navy (#0a1834), nothing else.
          This visually matches res/drawable/splash_background.xml so the user
          perceives ONE continuous splash screen, not native-then-web.

          The inline <style> in <head> sets the body background to navy immediately,
          BEFORE Tailwind CSS loads — so there's no white flash during page load.
          The inline <div id="initial-loader"> renders the icon instantly when the
          browser parses the body. /loader.js fades it out once React hydrates.
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
          /* The web loader — shows ONLY a centered app icon on solid navy,
             matching the native Android splash (res/drawable/splash_background.xml)
             EXACTLY. No text, no spinner, no glow, no border. When the native
             splash hands off to the WebView, the user sees an identical screen
             and perceives ONE continuous splash, not two. */
          #initial-loader {
            position: fixed;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #0a1834;
            z-index: 9999;
          }
          #initial-loader .loader-logo {
            width: 120px;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          #initial-loader .loader-logo img {
            width: 120px;
            height: 120px;
            object-fit: contain;
          }
        `}} />
        {/*
          Loader + Service Worker script.
          Loaded from /public/loader.js as a synchronous <script src> tag.
          We use a separate file instead of dangerouslySetInnerHTML because
          Next.js App Router serializes inline scripts as RSC payload data
          (self.__next_f.push) instead of rendering them as executable <script>
          tags. A <script src="..."> tag is always rendered as raw HTML, so it
          executes reliably.

          The script:
          1. Registers the PWA service worker
          2. Removes the #initial-loader div after the page loads
             (the loader shows the app icon while React hydrates)
        */}
        <script src="/loader.js" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/*
          Inline loading screen — renders IMMEDIATELY when the browser parses the
          body, before React hydrates. Shows ONLY the app icon on navy, matching
          the native Android splash exactly. /loader.js fades it out once the
          page is fully loaded so the user sees the actual app.
        */}
        <div id="initial-loader">
          <div class="loader-logo"><img src="/app-icon.png" alt="" /></div>
        </div>
        {children}
        <Toaster />
        <SonnerToaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  );
}
