// ESWATINI CARS — Developer Handoff Guide
// Generates a clean, professional .docx using docx-js
// Run: node /home/z/my-project/scripts/build-handoff-guide.js

const {
  Document, Packer, Paragraph, TextRun, Header, Footer, PageNumber,
  AlignmentType, HeadingLevel, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType, PageBreak, LevelFormat, convertInchesToTwip,
} = require("docx");
const fs = require("fs");

// ────────────────────────────────────────────────────────────────────────────
// 1. DESIGN TOKENS — Dawn Mist Tech palette
// ────────────────────────────────────────────────────────────────────────────
const P = {
  primary:   "0A1628",  // dark navy — headings
  body:      "1A2B40",  // near-black — body
  secondary: "6878A0",  // muted blue — captions
  accent:    "5B8DB8",  // mid blue — table headers, lines
  surface:   "F4F8FC",  // very pale blue — alt rows
  danger:    "B23A48",  // red — "DO NOT" warnings
  ok:        "2E7D5B",  // green — "DO" recommendations
};
const FONT = { ascii: "Calibri", eastAsia: "Microsoft YaHei" };

// ────────────────────────────────────────────────────────────────────────────
// 2. COMPONENT BUILDERS
// ────────────────────────────────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    border: { bottom: { color: P.accent, size: 8, style: BorderStyle.SINGLE, space: 4 } },
    children: [new TextRun({ text, bold: true, color: P.primary, font: FONT, size: 32 })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, color: P.primary, font: FONT, size: 26 })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, color: P.accent, font: FONT, size: 22 })],
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 22, color: P.body, font: FONT, ...opts })],
  });
}
function pRich(runs) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 120 },
    children: runs.map(r => new TextRun({ size: 22, color: P.body, font: FONT, ...r })),
  });
}
function bullet(text, level = 0) {
  return new Paragraph({
    spacing: { line: 280, after: 60 },
    indent: { left: 720 + level * 360, hanging: 240 },
    children: [
      new TextRun({ text: "• ", color: P.accent, bold: true, size: 22, font: FONT }),
      new TextRun({ text, size: 22, color: P.body, font: FONT }),
    ],
  });
}
function bulletRich(runs, level = 0) {
  return new Paragraph({
    spacing: { line: 280, after: 60 },
    indent: { left: 720 + level * 360, hanging: 240 },
    children: [
      new TextRun({ text: "• ", color: P.accent, bold: true, size: 22, font: FONT }),
      ...runs.map(r => new TextRun({ size: 22, color: P.body, font: FONT, ...r })),
    ],
  });
}
function code(text) {
  return new Paragraph({
    spacing: { line: 260, before: 60, after: 60 },
    shading: { type: ShadingType.CLEAR, fill: P.surface, color: "auto" },
    children: [new TextRun({ text, size: 20, color: P.primary, font: { ascii: "Consolas", eastAsia: "Microsoft YaHei" } })],
  });
}
function callout(label, text, kind = "info") {
  const fill = kind === "danger" ? "FCEEEE" : kind === "ok" ? "EEF7F2" : P.surface;
  const border = kind === "danger" ? P.danger : kind === "ok" ? P.ok : P.accent;
  const labelText = kind === "danger" ? "DO NOT" : kind === "ok" ? "DO" : label;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 12, color: border },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: border },
      left: { style: BorderStyle.SINGLE, size: 24, color: border },
      right: { style: BorderStyle.SINGLE, size: 4, color: border },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
    },
    rows: [new TableRow({ children: [
      new TableCell({
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        shading: { type: ShadingType.CLEAR, fill, color: "auto" },
        children: [
          new Paragraph({ spacing: { after: 60 }, children: [
            new TextRun({ text: labelText, bold: true, color: border, font: FONT, size: 20 }),
          ]}),
          new Paragraph({ spacing: { line: 280 }, children: [
            new TextRun({ text, size: 22, color: P.body, font: FONT }),
          ]}),
        ],
      }),
    ]})],
  });
}
function spacer(twips = 200) {
  return new Paragraph({ spacing: { before: twips, after: 0 }, children: [new TextRun({ text: "" })] });
}

// Simple table helper
function makeTable(headerRow, dataRows, colWidths) {
  const totalWidth = 9000;
  const widths = colWidths || headerRow.map(() => Math.floor(totalWidth / headerRow.length));

  const headerCells = headerRow.map((text, i) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    shading: { type: ShadingType.CLEAR, fill: P.accent, color: "auto" },
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text, bold: true, color: "FFFFFF", font: FONT, size: 20 })],
    })],
  }));

  const rows = [new TableRow({ tableHeader: true, cantSplit: true, children: headerCells })];

  dataRows.forEach((row, rIdx) => {
    const fill = rIdx % 2 === 0 ? "FFFFFF" : P.surface;
    const cells = row.map((text, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      shading: { type: ShadingType.CLEAR, fill, color: "auto" },
      children: [new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: 280 },
        children: [new TextRun({ text, size: 20, color: P.body, font: FONT })],
      })],
    }));
    rows.push(new TableRow({ cantSplit: true, children: cells }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: P.accent },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: P.accent },
      left: { style: BorderStyle.SINGLE, size: 4, color: P.accent },
      right: { style: BorderStyle.SINGLE, size: 4, color: P.accent },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "C0CCD8" },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "C0CCD8" },
    },
    rows,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// 3. COVER PAGE
// ────────────────────────────────────────────────────────────────────────────
function buildCover() {
  return [
    spacer(2400),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 80 },
      children: [new TextRun({ text: "ESWATINI CARS", color: P.accent, bold: true, font: FONT, size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 240 },
      border: { bottom: { color: P.accent, size: 18, style: BorderStyle.SINGLE, space: 6 } },
      children: [new TextRun({ text: "", size: 8 })],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
      children: [new TextRun({
        text: "Developer Handoff Guide",
        bold: true, color: P.primary, font: FONT, size: 72,
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 600, line: 360 },
      children: [new TextRun({
        text: "Everything a new developer needs to take over the project — source code, architecture, credentials, deployment, and risk mitigation.",
        color: P.secondary, font: FONT, size: 24,
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Prepared for", color: P.secondary, font: FONT, size: 18 })],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 240 },
      children: [new TextRun({ text: "Project Owner", bold: true, color: P.primary, font: FONT, size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Date", color: P.secondary, font: FONT, size: 18 })],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 240 },
      children: [new TextRun({ text: "18 November 2026", color: P.primary, font: FONT, size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Version", color: P.secondary, font: FONT, size: 18 })],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 240 },
      children: [new TextRun({ text: "1.0 — Complete handoff package", color: P.primary, font: FONT, size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Confidentiality", color: P.secondary, font: FONT, size: 18 })],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({
        text: "Internal use only. Contains credential inventory and access strategy. Do not share outside the project.",
        italics: true, color: P.secondary, font: FONT, size: 22,
      })],
    }),
  ];
}

// ────────────────────────────────────────────────────────────────────────────
// 4. BODY CONTENT
// ────────────────────────────────────────────────────────────────────────────
const body = [
  // ===== 1. EXECUTIVE SUMMARY =====
  h1("1. Executive Summary"),
  p("This document is your contingency plan. If the AI assistant you have been working with becomes unavailable — whether because of an AI industry downturn, a vendor shutdown, a pricing change, or any other reason — you are not starting from zero. Everything required to continue the Eswatini Cars project with a human developer is already prepared and packaged."),
  p("Three deliverables accompany this guide:"),
  bulletRich([{ text: "eswatini-cars-source.zip", bold: true }, { text: " — clean source code (3.7 MB) containing the web app, mobile app, Android APK wrapper, all configs, all scripts, and the work log. No dependencies, no build artifacts, no real secrets." }]),
  bulletRich([{ text: "eswatini-cars-secrets-template.env", bold: true }, { text: " — a blank template listing every environment variable the code uses, with comments explaining where each value comes from." }]),
  bulletRich([{ text: "ESWATINI-CARS-HANDOFF-GUIDE.docx", bold: true }, { text: " — this document." }]),
  p("In addition, the live source code is already pushed to a private GitHub repository at github.com/mlandvodlamini12-cloud/eswatini-cars. That repository is the canonical source of truth. The zip in this package is a snapshot taken on 18 November 2026."),
  spacer(80),
  callout("KEY DECISION", "Treat the GitHub repository as your primary backup, not this zip. The zip is for offline safety. To bring a new developer into the project, give them access to the GitHub repo, not the zip.", "info"),

  // ===== 2. PROJECT OVERVIEW =====
  h1("2. The Eswatini Cars Project — At a Glance"),
  p("Eswatini Cars is a managed vehicle marketplace for the Eswatini market. Sellers list cars, parts, and vehicles for sale. Buyers browse, search, and contact sellers through the platform. The platform also auto-posts new listings to a linked Facebook Page, sends email notifications via Resend, stores images on Cloudinary, and uses a Turso cloud database."),
  h2("2.1 The Three Components"),
  makeTable(
    ["Component", "Location", "Purpose"],
    [
      ["Web app", "src/ (Next.js 16)", "The main marketplace — browsing, searching, listing, enquiries, admin, auth"],
      ["Mobile app", "native-app/eswatini-cars-native/ (React Native + Expo)", "Native Android version of the marketplace — same backend, native UI"],
      ["Android wrapper", "android-apk/ (Gradle project)", "Trusted Web Activity wrapper that packages the web app as an installable APK"],
    ],
    [2000, 3000, 4000],
  ),
  spacer(120),
  h2("2.2 Production Deployment"),
  p("The web app is deployed on Vercel (or Netlify — config exists for both). The Android APK is built locally and distributed via a download link on the website. The mobile app is built with Expo EAS and distributed via the same channel. The database is Turso (libSQL), image storage is Cloudinary, email is Resend, and Facebook Graph API is used for auto-posting."),

  // ===== 3. TECH STACK =====
  h1("3. Tech Stack & Architecture"),
  h2("3.1 Web Application"),
  makeTable(
    ["Layer", "Technology", "Version"],
    [
      ["Framework", "Next.js", "16.1.3 (App Router)"],
      ["Language", "TypeScript", "5.x"],
      ["UI library", "React", "19.3.1"],
      ["Styling", "Tailwind CSS", "4.3.3 + tw-animate-css"],
      ["Components", "shadcn/ui (Radix primitives)", "60+ components in src/components/ui/"],
      ["Forms", "react-hook-form + zod", "7.x / 3.x"],
      ["State", "Zustand", "5.x"],
      ["Auth", "NextAuth.js (Auth.js) beta", "5.0.0-beta.32"],
      ["Database ORM", "Prisma", "6.4.1 with driverAdapters preview"],
      ["Database", "Turso (libSQL)", "via @prisma/adapter-libsql"],
      ["Image storage", "Cloudinary", "2.11.0"],
      ["Email", "Resend", "6.34.1"],
      ["Facebook Graph", "fetch / axios", "manual integration in src/lib/facebook.ts"],
      ["Mobile push / analytics", "Firebase", "13.1.0 (optional)"],
      ["Charts", "Recharts", "2.13.3"],
      ["Package manager", "Bun (preferred) or npm", "bun.lock + package-lock.json"],
    ],
    [2500, 3500, 3000],
  ),
  spacer(120),
  h2("3.2 Mobile Application"),
  makeTable(
    ["Layer", "Technology"],
    [
      ["Framework", "React Native via Expo (managed workflow)"],
      ["Navigation", "React Navigation (likely — verify in App.tsx)"],
      ["API client", "src/api.ts, src/sellApi.ts, src/messagesApi.ts, src/auth.ts"],
      ["Screens", "Register, Login, Sell, Search, Profile, Browse, CarDetail, Messages"],
      ["Build", "EAS Build (eas.json present)"],
      ["Target", "Android only (arm64 filter — reduces APK from 90MB to ~30MB)"],
    ],
    [3000, 6000],
  ),
  spacer(120),
  h2("3.3 Android APK Wrapper"),
  p("The android-apk/ folder is a Gradle project that builds a Trusted Web Activity (TWA) wrapper around the web app. It packages the website into an installable .apk file with native app icon, splash screen, and assetlinks.json for digital asset verification. This is what end-users download from the website."),

  // ===== 4. SOURCE CODE BUNDLE =====
  h1("4. Source Code Bundle — What's Inside"),
  p("The eswatini-cars-source.zip file contains a clean snapshot of the project. Here is the file map:"),
  makeTable(
    ["Path", "What it is"],
    [
      ["src/", "All application code — 94 files (Next.js app, API routes, lib, components, hooks)"],
      ["prisma/schema.prisma", "Database schema — 9 models (Listing, Enquiry, Message, User, Broadcast, UserRead, VehicleRequest, ContactMessage, ContactReply)"],
      ["public/", "Static assets — logo, app icon, manifest.json, service worker, robots.txt, NR Solar marketing images"],
      ["scripts/", "57 utility scripts — DB setup, seeding, image migration, APK build/sign, release JSON, credentials PDF generator"],
      ["native-app/eswatini-cars-native/", "React Native mobile app source (App.tsx, screens, API clients, EAS config)"],
      ["android-apk/", "Gradle project for TWA wrapper (MainActivity.java, AndroidManifest.xml, icons, splash)"],
      ["tests/", "3 runtime build test scripts"],
      ["db/custom.db", "Empty local SQLite fallback (zero rows — safe to share)"],
      ["package.json, bun.lock, package-lock.json", "Dependency manifest + lockfiles"],
      ["next.config.ts, tsconfig.json, tailwind.config.ts, postcss.config.mjs", "Build configs"],
      ["components.json", "shadcn/ui config"],
      ["vercel.json, netlify.toml, Caddyfile", "Deployment configs for Vercel, Netlify, and local Caddy proxy"],
      [".gitignore, .npmrc, eslint.config.mjs", "Repo hygiene configs"],
      ["worklog.md", "126 KB work log — every task the AI has performed, in chronological order. invaluable for project archaeology"],
    ],
    [3500, 5500],
  ),
  spacer(120),
  h2("4.1 What Is Excluded (and Why)"),
  bulletRich([{ text: "node_modules/", bold: true }, { text: " (1.2 GB) — regenerated by running `bun install` or `npm install`. Reconstructable from package.json." }]),
  bulletRich([{ text: ".next/", bold: true }, { text: " (103 MB) — build output. Regenerated by running `bun run build`." }]),
  bulletRich([{ text: ".env", bold: true }, { text: " — contains real Turso URL + token. EXCLUDED for safety. Use the secrets template instead." }]),
  bulletRich([{ text: ".git/", bold: true }, { text: " — the git history. The repo itself lives on GitHub; you do not need the local .git folder." }]),
  bulletRich([{ text: "dev.log, *.log", bold: true }, { text: " — runtime debug logs. Not useful to a new developer." }]),

  // ===== 5. ENVIRONMENT VARIABLES =====
  h1("5. Environment Variables — Complete Reference"),
  p("The application reads configuration from environment variables. The full list, with where each value comes from, is in the accompanying eswatini-cars-secrets-template.env file. Below is a summary grouped by service."),
  h2("5.1 The Ten Groups"),
  makeTable(
    ["Group", "Variables", "Source"],
    [
      ["1. Database", "DATABASE_URL, DATABASE_AUTH_TOKEN", "Turso dashboard → database → Settings"],
      ["2. Email", "RESEND_API_KEY, EMAIL_FROM, EMAIL_ADMIN", "Resend dashboard → API keys"],
      ["3. Images", "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET", "Cloudinary console → API keys"],
      ["4. Facebook", "FACEBOOK_PAGE_ID, FACEBOOK_PAGE_ACCESS_TOKEN", "Meta for Developers → your app → Page access token"],
      ["5. Auth", "NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET", "Generate secret via `openssl rand -base64 32`. Google creds from Google Cloud Console."],
      ["6. Firebase", "FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, + 4 more", "Firebase console → Project settings"],
      ["7. Admin", "ADMIN_PIN, ADMIN_EMAIL_ALLOWLIST", "You choose these"],
      ["8. APK signing", "APK_KEYSTORE_PASSWORD, APK_KEYSTORE_ALIAS, APK_KEYSTORE_DNAME, + 4 more", "Generated locally with keytool"],
      ["9. Vercel", "VERCEL_TOKEN, VERCEL_TEAM_SLUG, + 4 more", "Vercel dashboard → Account → Tokens"],
      ["10. Node env", "NODE_ENV", "Auto-set by Next.js — no need to configure"],
    ],
    [1500, 4000, 3500],
  ),
  spacer(120),
  callout("CRITICAL", "Real .env values MUST NEVER be sent over chat, email, Slack, WhatsApp, or attached to a Word document. Use a password manager (Bitwarden is free, 1Password and Proton Pass are also good) and share via secure link that expires after first view.", "danger"),

  // ===== 6. EXTERNAL SERVICES & ACCOUNTS =====
  h1("6. External Services & Accounts Inventory"),
  p("These are the third-party services the project depends on. You — the project owner — should be the owner of every account. A developer should never own these. If a developer set one up for you, transfer ownership before they leave."),
  makeTable(
    ["Service", "Purpose", "URL", "Your ownership status"],
    [
      ["GitHub", "Source code repository (private)", "github.com/mlandvodlamini12-cloud/eswatini-cars", "Owned by you (mlandvodlamini12-cloud account)"],
      ["Turso", "Cloud database (libSQL)", "tursocloud.app", "Verify: log in with your email, see the database"],
      ["Cloudinary", "Image storage + CDN", "cloudinary.com/console", "Verify: log in, see your cloud name"],
      ["Resend", "Transactional email", "resend.com", "Verify: log in, see API keys + sender domain"],
      ["Meta for Developers", "Facebook auto-posting", "developers.facebook.com", "Verify: your FB app + Page access"],
      ["Vercel", "Web hosting (production)", "vercel.com", "Verify: log in, see your project + domain"],
      ["Netlify", "Alternative hosting (config exists)", "netlify.com", "Optional — only if you switched from Vercel"],
      ["Firebase", "Mobile push / analytics (optional)", "console.firebase.google.com", "Verify if you ever set this up"],
      ["Google Cloud Console", "Google Sign-In OAuth", "console.cloud.google.com", "Verify: APIs & Services → Credentials"],
      ["Expo EAS", "Mobile app build service", "expo.dev", "Verify: log in, see your project"],
      ["Domain registrar", "Your custom domain (if any)", "—", "Verify: which registrar holds your domain"],
    ],
    [1800, 2200, 2800, 3200],
  ),

  // ===== 7. WHAT TO GIVE / NOT GIVE =====
  h1("7. What to Give a Developer — and What to Keep Private"),
  p("This is the most important section of this document. Read it twice."),
  h2("7.1 GIVE the developer"),
  bullet("The GitHub repository — invite them as a collaborator on the private repo. They will clone it themselves; you do not need to send files."),
  bullet("The eswatini-cars-source.zip file — only if they cannot access GitHub for some reason (e.g., offline work, code review before granting repo access)."),
  bullet("This handoff guide document — so they understand the architecture, scripts, and conventions."),
  bullet("The secrets template file (eswatini-cars-secrets-template.env) — it has placeholders only, no real values. Safe to share."),
  bullet("Access to a non-production deployment — e.g., a Vercel preview environment or a staging Turso database — where they can test without touching live data."),
  bullet("A test/sandbox Cloudinary cloud, a test Resend API key (Resend gives you a free test key onboarding@resend.dev that only sends to your own email)."),
  bullet("A test Facebook Page (create a second Page for development), or temporarily disable the Facebook integration in their environment."),
  bullet("The worklog.md file — it is inside the zip and inside the repo. It documents every decision made. Extremely valuable for understanding why things are the way they are."),
  spacer(80),
  h2("7.2 DO NOT GIVE the developer (and why)"),
  callout("DO NOT", "Your real Turso DATABASE_URL and DATABASE_AUTH_TOKEN for the production database. A developer with prod DB credentials can read every user's data, delete the database, or accidentally run a destructive migration. Give them a separate staging database, or have them use the local SQLite fallback (db/custom.db) for development.", "danger"),
  callout("DO NOT", "Your production Resend API key. Resend keys can send email as your domain — a leaked key means someone can phish your users from your own domain. Resend gives you a free test key (re_...) that only delivers to your verified address. Give developers that one.", "danger"),
  callout("DO NOT", "Your production Cloudinary API secret. Cloudinary secrets can delete every image on your CDN. Create a second Cloudinary cloud (free tier is generous) and give the developer that one's credentials instead.", "danger"),
  callout("DO NOT", "Your Facebook Page access token for the production Page. A Page token can post, delete posts, and read messages from your customers. Create a second Facebook Page for development/testing.", "danger"),
  callout("DO NOT", "Your NEXTAUTH_SECRET in production. It is used to sign session cookies — anyone with it can forge admin sessions. Generate a new one for the developer's local environment.", "danger"),
  callout("DO NOT", "Your Google Client Secret from the production OAuth client. Create a separate OAuth client for development. Google makes this easy — same project, different client ID/secret.", "danger"),
  callout("DO NOT", "Your APK signing keystore password or the keystore file itself. The signing key is your identity on Google Play. If a developer signs an APK with your key and uploads malware, Google will think it is you. The developer should build unsigned or debug-signed APKs; you sign the final release APK yourself.", "danger"),
  callout("DO NOT", "Your Vercel token, your GitHub password, your email account access, or anything else that lets them impersonate you. Use repo collaborator invites (scoped), not account sharing.", "danger"),
  h2("7.3 The Rule of Thumb"),
  callout("PRINCIPLE", "If a credential lets someone do something as YOU (send email as your domain, post as your Facebook Page, sign APKs as your company, deploy to your production URL, read your users' data) — it stays with you. The developer gets a parallel, isolated environment with parallel credentials that they cannot use to affect production.", "info"),

  // ===== 8. HIRING A DEVELOPER =====
  h1("8. How to Hire a Developer — Step by Step"),
  h2("Step 1 — Define the role clearly"),
  p("Decide what you actually need. Three common shapes:"),
  bulletRich([{ text: "Maintenance only", bold: true }, { text: " — fix bugs, keep dependencies updated, deploy small changes. Budget: part-time, retainer model, USD 200–600/month." }]),
  bulletRich([{ text: "Feature development", bold: true }, { text: " — build new features (e.g., payments, saved searches, push notifications). Budget: full-time or fixed-scope contracts, USD 800–2500/feature depending on complexity." }]),
  bulletRich([{ text: "Full takeover", bold: true }, { text: " — own the codebase end-to-end, deploy, monitor, respond to incidents. Budget: full-time, USD 1500–4000/month for a mid-level full-stack developer in Africa or Eastern Europe." }]),
  h2("Step 2 — Write a one-paragraph job post"),
  p("Use this template, filling in the blanks:"),
  code("Looking for a full-stack developer to take over and maintain an existing marketplace web app.\n\nStack: Next.js 16 (App Router), TypeScript, Tailwind, Prisma, Turso (libSQL), Cloudinary, Resend, NextAuth.\nMobile: React Native (Expo) for Android.\nDeployment: Vercel.\n\nThe codebase is already in production. Your job: [maintenance / new features / full takeover].\nMust be comfortable reading existing code and making targeted changes — not a rewrite.\n\nLocation: [remote / Eswatini / anywhere].\nBudget: [state your range].\nTime commitment: [X hours/week].\n\nTo apply: clone github.com/[you]/eswatini-cars (I will grant access), run it locally,\nand send me a one-paragraph summary of how the app works. Do not send a CV first."),
  h2("Step 3 — Where to post"),
  bullet("Upwork (upwork.com) — large pool, escrow payments, good for fixed-scope contracts. Filter by 90%+ job success, 100+ hours, top-rated plus."),
  bullet("Toptal (toptal.com) — premium, pre-vetted developers, more expensive (USD 50–100/hr) but reliable for long-term takeover."),
  bullet("Fiverr Pro (fiverr.com/pro) — for fixed-scope tasks. Avoid non-Pro Fiverr for serious work."),
  bullet("Local Eswatini / South African developer communities — LinkedIn, the ZA Dev Slack, university CS departments. Lower rates, same timezone, easier to build trust."),
  bullet("GitHub — search for developers who have contributed to Next.js, Prisma, or Turso projects. Their profile IS their CV."),
  h2("Step 4 — The filtering test"),
  p("Before you hire anyone, give them access to the GitHub repo (or send them the zip) and ask them to:"),
  bullet("Clone the repo locally and run `bun install && bun run dev`"),
  bullet("Get the app running on their machine using the local SQLite fallback (no real credentials needed)"),
  bullet("Send you a one-paragraph summary of how the app works, in their own words"),
  bullet("Identify one bug or improvement and explain how they would fix it"),
  p("This test costs them 1–2 hours of unpaid work. Serious developers will do it. Anyone who refuses or asks for payment before looking at the code is a red flag. The summary they send back tells you more than any CV: did they understand the architecture? did they read the worklog? can they write clearly?"),
  spacer(80),
  callout("RED FLAG", "Any candidate who wants to rewrite the app from scratch. The codebase works, it is in production, and a rewrite is almost always a costly mistake. You want a maintainer, not a rebuild zealot.", "danger"),
  h2("Step 5 — Sign a simple contract"),
  p("Before they touch anything, sign a 1–2 page contract covering:"),
  bullet("Scope of work (one paragraph — what they will and will not do)"),
  bullet("Payment terms (hourly rate, or fixed fee per milestone, and how you pay — Wise, PayPal, bank transfer)"),
  bullet("IP assignment — \"All work product is work made for hire and belongs to the client upon payment in full.\""),
  bullet("Confidentiality — they will not share the codebase, credentials, or user data with anyone"),
  bullet("Termination — either party can end with 14 days' written notice; you retain access to all work done to date"),
  bullet("No sub-contracting without your written consent"),
  p("You do not need a lawyer for this. A plain-English contract signed by both parties is enforceable in most jurisdictions. If you want to be safe, spend USD 50 on a Rocket Lawyer or similar template."),

  // ===== 9. ONBOARDING =====
  h1("9. Onboarding Plan — Day 1 to Day 14"),
  h2("Day 1 — Access"),
  bullet("You invite developer to GitHub repo as a collaborator (Settings → Manage access → Add people → Write role)"),
  bullet("You create a Vercel preview project (or a second Vercel project) and invite them as a team member"),
  bullet("You create a separate Turso database called eswatini-cars-dev, generate a token, and share via Bitwarden"),
  bullet("You create a Cloudinary cloud called eswatini-cars-dev (free tier), share its credentials via Bitwarden"),
  bullet("You share the secrets template and the Bitwarden folder containing the dev credentials"),
  bullet("You send them this handoff guide"),
  h2("Day 2–3 — Local environment"),
  bullet("Developer clones the repo, runs `bun install && bun run dev`"),
  bullet("They create a local .env file using the template, filling in the dev credentials you shared"),
  bullet("They run `bun run db:push` to create the dev database tables"),
  bullet("They run `bun run scripts/turso-seed-demo.ts` to load demo data"),
  bullet("They confirm the app loads at localhost:3000, listings display, enquiry form submits"),
  h2("Day 4–5 — Codebase orientation"),
  bullet("Developer reads the worklog.md file end-to-end (this is the most important doc)"),
  bullet("They read prisma/schema.prisma — the 9 models are the heart of the data layer"),
  bullet("They read src/app/api/route.ts (health check), src/lib/db.ts (Prisma client), src/lib/session.ts (auth)"),
  bullet("They trace one full flow: list a car → see it appear → enquire → see email notification (in dev Resend logs)"),
  h2("Day 6–7 — First small change"),
  bullet("You assign them one tiny, well-defined task: e.g., \"add a 'saved listings' count to the admin dashboard\" or \"change the colour of the enquiry button on mobile\""),
  bullet("They submit a Pull Request on GitHub (not push to main directly)"),
  bullet("You review the PR — even if you are not technical, ask them to walk you through what they changed and why"),
  bullet("You merge the PR once you understand and agree with the change"),
  h2("Day 8–14 — Trust building"),
  bullet("Increase task complexity gradually — first bug fixes, then small features, then deployment"),
  bullet("Set up a weekly 30-minute call: what did you do this week? what is blocking you? what will you do next week?"),
  bullet("After 14 days of solid work, decide whether to continue. If yes, move to a longer-term retainer or contract"),
  spacer(80),
  callout("DO", "Use Pull Requests from day one. Even if you are the only reviewer and you do not understand the code, the PR record is invaluable — it documents what changed, when, and why. If the developer later disappears, the PR history is your project archaeology.", "ok"),

  // ===== 10. RISK MITIGATION =====
  h1("10. Risk Mitigation — AI, Vendor Lock-in, and Bus Factor"),
  h2("10.1 The AI bubble risk"),
  p("You raised this concern: if AI vendors collapse, your AI assistant disappears. The mitigation is already in place:"),
  bullet("All code is in a private GitHub repo you own — not on any AI vendor's servers"),
  bullet("All external services (Turso, Cloudinary, Resend, Vercel, Facebook, Expo) are in your name, with your email as the primary contact"),
  bullet("All work history is captured in worklog.md inside the repo — even if the AI disappears tomorrow, a human developer can read every decision that was made"),
  bullet("The handoff guide (this document) bridges the gap between \"AI-assisted development\" and \"human-maintained development\""),
  p("The AI was a development accelerator, not a runtime dependency. Once the code is deployed, the AI's involvement is over. The application does not call any AI service at runtime (unless you later add one — at which point that becomes a new dependency to manage)."),
  h2("10.2 Vendor lock-in risk"),
  p("Each external service can be replaced without rewriting the app:"),
  makeTable(
    ["Service", "Lock-in level", "Replacement path"],
    [
      ["Turso", "Low", "Prisma supports Postgres, MySQL, MongoDB. Change DATABASE_URL, run `prisma db push`, done."],
      ["Cloudinary", "Low", "Images are stored as URLs in the Listing.imageUrl field. Swap to AWS S3, ImageKit, or local filesystem by changing src/lib/cloudinary.ts."],
      ["Resend", "Very low", "Email sending is wrapped in src/lib/email.ts. Swap to SendGrid, Mailgun, Postmark by changing one file."],
      ["Facebook Graph API", "None", "Optional feature. Disable by leaving FACEBOOK_PAGE_ACCESS_TOKEN unset. Code degrades gracefully."],
      ["Vercel", "Low", "Netlify config already exists. Railway, Fly.io, and self-hosting are also options for Next.js."],
      ["Google Sign-In", "Low", "Optional. Users can still register with email+password. Remove GOOGLE_CLIENT_* and Google login disappears."],
      ["Firebase", "None", "Optional. Code degrades gracefully without it."],
      ["GitHub", "Very low", "Git is portable. Move to GitLab, Bitbucket, or self-hosted Gitea in under an hour."],
    ],
    [1500, 1500, 6000],
  ),
  spacer(120),
  h2("10.3 Bus factor"),
  p("\"Bus factor\" is the number of people who need to be hit by a bus before the project dies. Right now your bus factor is 1 — you, plus whatever the AI remembers. After hiring a developer it becomes 2. To raise it further:"),
  bullet("Keep documentation in the repo (worklog.md, this guide, the README once you write one)"),
  bullet("Have the developer write a short note in worklog.md every time they make a non-trivial change"),
  bullet("Record Loom videos (loom.com — free) of yourself explaining the project once a quarter. These become priceless onboarding material"),
  bullet("Never let any single person be the only one who knows a password. Use Bitwarden's shared folders so multiple people can access production credentials (with audit logging)"),

  // ===== 11. APPENDIX A — COMMANDS =====
  h1("11. Appendix A — Useful Commands"),
  h2("11.1 Local development"),
  code("cd eswatini-cars\nbun install         # or: npm install\nbun run dev         # starts dev server on http://localhost:3000\nbun run build       # production build\nbun run start       # run production build\nbun run lint        # eslint"),
  h2("11.2 Database"),
  code("bun run db:generate   # generate Prisma client (also runs on postinstall)\nbun run db:push      # push schema to Turso (creates/updates tables)\nbun run db:studio    # open Prisma Studio — visual DB browser at localhost:5555\nbun run db:setup     # create tables via raw libSQL (alternative to db:push)\nbun run db:seed      # seed demo listings (6 cars)"),
  h2("11.3 Mobile app"),
  code("cd native-app/eswatini-cars-native\nbun install         # or: npm install\nbun start           # Expo dev server (scan QR with Expo Go on Android)\nbun run android     # build & run on Android device/emulator\n# Production build (requires Expo account + EAS):\neas build --platform android --profile production"),
  h2("11.4 Android APK wrapper"),
  code("cd android-apk\n./gradlew assembleRelease    # produces app-release.apk in app/build/outputs/apk/release/\n# To sign the release APK (you do this, not the developer):\npython3 ../scripts/sign_apk.py --apk app-release.apk --keystore release.keystore"),
  h2("11.5 Git"),
  code("git clone https://github.com/mlandvodlamini12-cloud/eswatini-cars.git\ngit pull origin main\ngit checkout -b feature/my-new-feature\ngit commit -am \"fix: describe what changed\"\ngit push origin feature/my-new-feature\n# Then open a Pull Request on GitHub"),

  // ===== 12. APPENDIX B — KEY FILES =====
  h1("12. Appendix B — Key Files & Their Purpose"),
  makeTable(
    ["File", "Purpose"],
    [
      ["prisma/schema.prisma", "Database schema — 9 models. THE source of truth for data structure."],
      ["src/lib/db.ts", "Prisma client init (uses Turso adapter). Every DB query goes through this."],
      ["src/lib/session.ts", "NextAuth session helper. Signs and verifies JWTs using NEXTAUTH_SECRET."],
      ["src/lib/cloudinary.ts", "Image upload/delete helpers. Degrades gracefully if not configured."],
      ["src/lib/email.ts", "Send email via Resend. Degrades gracefully if not configured."],
      ["src/lib/facebook.ts", "Auto-post listings to Facebook Page. Optional."],
      ["src/lib/firebase.ts / firebase-admin.ts", "Firebase client + admin SDK. Optional (push/analytics)."],
      ["src/app/api/listings/route.ts", "GET (browse) and POST (create listing) endpoints."],
      ["src/app/api/enquiries/route.ts", "Buyer enquiries — triggers email notification to seller."],
      ["src/app/api/auth/*", "Login, register, logout, Google, me (current user) endpoints."],
      ["src/app/api/admin/*", "Admin stats and user management (requires admin email allowlist)."],
      ["src/app/api/upload/route.ts", "Image upload endpoint (Cloudinary)."],
      ["src/app/page.tsx", "Homepage — the main browse/search UI."],
      ["src/app/layout.tsx", "Root layout — providers, fonts, metadata."],
      ["src/components/ui/*", "60+ shadcn/ui components (button, card, dialog, table, etc.)."],
      ["next.config.ts", "Next.js config — Cloudinary remote pattern, removed static export."],
      ["vercel.json", "Cron job config (weekly image cleanup)."],
      ["netlify.toml", "Alternative deploy config + security headers + APK MIME types."],
      ["worklog.md", "126 KB work log. READ THIS FIRST when onboarding."],
    ],
    [3500, 5500],
  ),

  // ===== 13. APPENDIX C — CREDENTIALS =====
  h1("13. Appendix C — Credentials Inventory"),
  p("Where each credential lives, and who should have access. Use this as your checklist for setting up a password manager (Bitwarden, 1Password, or Proton Pass are all good)."),
  makeTable(
    ["Credential", "Where it lives today", "Who should have it", "Action to take"],
    [
      ["Turso DATABASE_URL", "In your .env (local) + Vercel env vars", "You + production Vercel only", "Create separate dev DB, share via Bitwarden"],
      ["Turso DATABASE_AUTH_TOKEN", "In your .env + Vercel env vars", "You + production Vercel only", "Create separate dev token, share via Bitwarden"],
      ["RESEND_API_KEY", "In your .env + Vercel env vars", "You + production Vercel only", "Give developer the free test key (re_...) only"],
      ["CLOUDINARY_API_SECRET", "In your .env + Vercel env vars", "You + production Vercel only", "Create dev cloud, share its credentials"],
      ["FACEBOOK_PAGE_ACCESS_TOKEN", "In your .env + Vercel env vars", "You only", "Create a second FB Page for development"],
      ["NEXTAUTH_SECRET", "In your .env + Vercel env vars", "You + production Vercel only", "Generate a new secret for the developer's env"],
      ["GOOGLE_CLIENT_SECRET", "In your .env + Vercel env vars", "You + production Vercel only", "Create a second OAuth client for development"],
      ["APK signing keystore + password", "Locally on your machine (NOT in repo)", "You only — never share", "Developer builds debug-signed APKs; you sign releases"],
      ["GitHub password / 2FA", "Your password manager", "You only", "Invite developer as repo collaborator instead"],
      ["Vercel account password", "Your password manager", "You only", "Invite developer as team member with limited role"],
      ["Domain registrar account", "Your password manager", "You only", "Never share. Update DNS yourself."],
    ],
    [2500, 2500, 2000, 3000],
  ),
  spacer(160),
  callout("FINAL NOTE", "You are not dependent on any single AI vendor, any single developer, or any single hosting provider. The project is portable, the code is yours, the documentation is in the repo. Hire slowly, give access incrementally, and use pull requests from day one. The work you have already done is more resilient than it feels.", "ok"),
];

// ────────────────────────────────────────────────────────────────────────────
// 5. ASSEMBLE DOCUMENT
// ────────────────────────────────────────────────────────────────────────────
const doc = new Document({
  creator: "Eswatini Cars",
  title: "Eswatini Cars — Developer Handoff Guide",
  description: "Comprehensive handoff guide for continuing the Eswatini Cars project with a human developer.",
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 22, color: P.body },
        paragraph: { spacing: { line: 312 } },
      },
    },
  },
  sections: [
    // COVER SECTION
    {
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 } } },
      children: buildCover(),
    },
    // BODY SECTION
    {
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1417, right: 1417 } } },
      headers: {
        default: new Header({ children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({
            text: "Eswatini Cars — Developer Handoff Guide",
            color: P.secondary, font: FONT, size: 18, italics: true,
          })],
        })]}),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", color: P.secondary, font: FONT, size: 18 }),
            new TextRun({ children: [PageNumber.CURRENT], color: P.secondary, font: FONT, size: 18 }),
            new TextRun({ text: " of ", color: P.secondary, font: FONT, size: 18 }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], color: P.secondary, font: FONT, size: 18 }),
          ],
        })]}),
      },
      children: body,
    },
  ],
});

// ────────────────────────────────────────────────────────────────────────────
// 6. WRITE FILE
// ────────────────────────────────────────────────────────────────────────────
Packer.toBuffer(doc).then(buf => {
  const outPath = "/home/z/my-project/download/ESWATINI-CARS-HANDOFF-GUIDE.docx";
  fs.writeFileSync(outPath, buf);
  console.log("✓ Handoff guide written: " + outPath);
  console.log("  Size: " + (buf.length / 1024).toFixed(1) + " KB");
}).catch(err => {
  console.error("✗ Failed to write document:", err);
  process.exit(1);
});
