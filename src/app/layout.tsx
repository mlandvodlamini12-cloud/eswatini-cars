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
        {/* Register service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('PWA SW registered:', registration.scope);
                  }).catch(function(err) {
                    console.log('PWA SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
