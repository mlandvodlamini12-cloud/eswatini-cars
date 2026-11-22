# Eswatini Cars — Data Recovery Procedure

This document describes how to recover data if something goes wrong.

## Backup Systems (3 layers of protection)

### Layer 1: Turso Automatic Backups (database)
- Turso takes daily automatic snapshots of your database
- Retained for 30 days
- To restore: log into tursocloud.app → your database → Backups → pick a date → Restore
- This handles: "the database crashed", "I accidentally deleted data", "a migration went wrong"

### Layer 2: Daily Email Backup (JSON export)
- Every day at 2:00 AM UTC, Vercel calls `/api/backup`
- The endpoint exports ALL data (listings, users, enquiries, messages, etc.) to JSON
- The JSON is emailed to `mlandvodlamini12@gmail.com` via Resend
- Each email has the backup as an attachment
- To restore: download the JSON attachment → import manually via a script
- This handles: "Turso lost everything", "I need to migrate to a new database provider"

### Layer 3: Cloudinary Permanent Storage (images)
- All user-uploaded images are stored on Cloudinary's CDN
- Cloudinary does NOT delete images unless you explicitly delete them
- Images are permanent — they don't expire, they don't break
- To restore: no need — they're always there
- This handles: "images disappeared from listings"

## Recovery Scenarios

### Scenario A: "A listing disappeared"
1. Check Turso backups: log into tursocloud.app → database → Backups → pick yesterday's backup → Restore
2. OR check your email for yesterday's daily backup JSON
3. The listing will reappear

### Scenario B: "All listings disappeared"
1. Don't panic — Turso has daily backups
2. Log into tursocloud.app → database → Backups → pick the most recent backup → Restore
3. All listings reappear instantly
4. If Turso is completely down:
   a. Find yesterday's backup email
   b. Download the JSON attachment
   c. Create a new Turso database
   d. Run the import script (TODO: create import script)
   e. Update DATABASE_URL env var on Vercel

### Scenario C: "Images are broken/blank"
1. Check if the image URL returns 200 (curl -I <url>)
2. If 404: the URL is broken (shouldn't happen for Cloudinary uploads)
3. Cloudinary images don't break — if they do, contact Cloudinary support
4. The broken image placeholder (car icon + retry button) lets users retry

### Scenario D: "A deploy broke the app"
1. Go to Vercel dashboard → your project → Deployments
2. Find the last working deploy (before the break)
3. Click the "..." menu → "Promote to Production"
4. The app instantly reverts to the working version
5. Fix the broken code → push → new deploy goes live

### Scenario E: "The APK is broken"
1. The APK loads the website live — so if the website is fixed, the APK is fixed
2. For Android wrapper bugs (Java code): rebuild APK via GitHub Actions
3. Go to GitHub → Actions → Build Android APK → Run workflow
4. Download new APK from Releases page
5. Users need to install the new APK (the auto-update banner handles website updates, but APK updates require manual install)

## Manual Backup (do this before risky changes)

1. Log in as admin
2. Visit: https://eswatini-cars.vercel.app/api/backup
3. A JSON file downloads with all your data
4. Save it somewhere safe

## Testing the Backup System

To test the daily email backup:
1. Set CRON_SECRET env var on Vercel (any random string)
2. Run: curl -H "x-cron-secret: YOUR_SECRET" https://eswatini-cars.vercel.app/api/backup
3. Check your email — you should receive the backup JSON

## What to Do RIGHT NOW (one-time setup)

1. Set CRON_SECRET on Vercel (Settings → Environment Variables → New):
   - Name: CRON_SECRET
   - Value: any random string (e.g., "backup-secret-2026-xyz")
2. The daily cron will run at 2:00 AM UTC and email you the backup
3. Each email has the full database as a JSON attachment
4. Keep the emails — they're your safety net

## Don't Lose These

- Turso database URL + auth token (in Vercel env vars)
- Cloudinary cloud name + API key + secret (in Vercel env vars)
- GitHub repo access (mlandvodlamini12-cloud/eswatini-cars)
- Vercel project access
- The APK signing keystore (in the repo at android-apk/app/release.keystore)
- Google Cloud Console OAuth client (for Google Sign-In)
