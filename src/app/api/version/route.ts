import { NextResponse } from 'next/server'

// GET /api/version — returns the latest APK version info.
// The Android app checks this on startup and shows an update popup
// if the user's installed version is older than the latest version.
//
// This is how Telegram, WhatsApp, and other non-Play-Store apps handle
// updates: the app checks a server endpoint, compares versions, and
// prompts the user to download the new APK if available.

export async function GET() {
  return NextResponse.json({
    latestVersionCode: 14,
    latestVersionName: '1.3.1',
    downloadUrl: 'https://github.com/mlandvodlamini12-cloud/eswatini-cars/releases/latest/download/Eswatini-Cars.apk',
    minRequiredVersionCode: 12,
    releaseNotes: 'Splash screen fixed — no more white background on app launch.',
  })
}
// Force re-deploy
