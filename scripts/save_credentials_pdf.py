"""
Generate the comprehensive credentials PDF for Eswatini Cars.
Loads all credentials from /home/z/my-project/.env.credentials (gitignored).
Saves PDF to /home/z/my-project/download/eswatini-cars-credentials.pdf

Usage:
    python3 scripts/save_credentials_pdf.py
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from datetime import datetime

# === Load credentials from gitignored .env.credentials file ===
CRED_FILE = "/home/z/my-project/.env.credentials"
if not os.path.exists(CRED_FILE):
    print(f"❌ Credentials file not found: {CRED_FILE}")
    print("   Create it from the template in scripts/credentials-template.env")
    exit(1)

CREDENTIALS = {}
with open(CRED_FILE, "r") as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        CREDENTIALS[key.strip()] = value.strip()

# Verify required keys exist
required_keys = [
    "TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "RESEND_API_KEY",
    "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "VERCEL_TOKEN",
    "APK_KEYSTORE_PASSWORD", "APK_SHA256_FINGERPRINT",
]
missing = [k for k in required_keys if k not in CREDENTIALS]
if missing:
    print(f"❌ Missing required credentials in {CRED_FILE}:")
    for k in missing:
        print(f"   - {k}")
    exit(1)

OUTPUT_PATH = "/home/z/my-project/download/eswatini-cars-credentials.pdf"

# === Color palette (dark + gold accents, matching brand) ===
COLOR_PRIMARY = HexColor("#0F172A")
COLOR_ACCENT = HexColor("#D4A017")
COLOR_DANGER = HexColor("#B91C1C")
COLOR_BG_SOFT = HexColor("#F8FAFC")
COLOR_BORDER = HexColor("#1E293B")

def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=20*mm, bottomMargin=20*mm,
        title="Eswatini Cars - Production Credentials",
        author="Eswatini Cars Project",
        subject="Production credentials for Turso, Resend, Cloudinary, Vercel, and APK signing",
        creator="Z.ai",
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("TitleCustom", parent=styles["Title"],
        fontName="Helvetica-Bold", fontSize=22, textColor=COLOR_PRIMARY,
        alignment=TA_CENTER, spaceAfter=6)
    subtitle_style = ParagraphStyle("SubtitleCustom", parent=styles["Normal"],
        fontName="Helvetica", fontSize=11, textColor=HexColor("#475569"),
        alignment=TA_CENTER, spaceAfter=18)
    section_style = ParagraphStyle("SectionH", parent=styles["Heading2"],
        fontName="Helvetica-Bold", fontSize=13, textColor=white,
        backColor=COLOR_PRIMARY, borderPadding=(6, 8, 6, 8),
        spaceBefore=14, spaceAfter=8)
    label_style = ParagraphStyle("Label", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=9, textColor=COLOR_PRIMARY)
    value_style = ParagraphStyle("Value", parent=styles["Normal"],
        fontName="Courier", fontSize=8.5, textColor=HexColor("#0F172A"),
        leading=11, wordWrap="LTR")
    warn_style = ParagraphStyle("Warn", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=10, textColor=COLOR_DANGER,
        spaceBefore=6, spaceAfter=6)
    note_style = ParagraphStyle("Note", parent=styles["Normal"],
        fontName="Helvetica", fontSize=9, textColor=HexColor("#475569"),
        leading=12)

    story = []

    # === HEADER ===
    story.append(Paragraph("ESWATINI CARS", title_style))
    story.append(Paragraph("Production Credentials — Secure Backup", subtitle_style))

    # === META INFO BOX ===
    meta_data = [
        [Paragraph("<b>Created:</b>", label_style),
         Paragraph(datetime.now().strftime("%d %B %Y, %H:%M"), value_style)],
        [Paragraph("<b>Owner:</b>", label_style),
         Paragraph("Mlandvo Dlamini (mlandvodlamini12@gmail.com)", value_style)],
        [Paragraph("<b>Project:</b>", label_style),
         Paragraph("Eswatini Cars — Used car broker marketplace", value_style)],
        [Paragraph("<b>Live URL:</b>", label_style),
         Paragraph(CREDENTIALS.get("VERCEL_PROJECT_URL", ""), value_style)],
        [Paragraph("<b>Storage:</b>", label_style),
         Paragraph("Keep this PDF in a password manager or encrypted folder.", value_style)],
    ]
    meta_table = Table(meta_data, colWidths=[35*mm, 130*mm])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), COLOR_BG_SOFT),
        ("BOX", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, HexColor("#CBD5E1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # === SECURITY WARNING ===
    story.append(Paragraph("⚠ SECURITY WARNING — READ CAREFULLY", warn_style))
    story.append(Paragraph(
        "The credentials in this PDF grant full access to your production database, "
        "email service, image storage, hosting platform, and APK signing identity. "
        "Anyone with these credentials can read/modify/delete your data, send emails "
        "as you, upload images to your account, deploy changes to your live website, "
        "or push APK updates that look like they're from you.<br/><br/>"
        "<b>Never</b> commit these to a public Git repository. <b>Never</b> paste them "
        "into chat rooms, screenshots, or social media. <b>Never</b> share this PDF "
        "via email or messaging apps. If you suspect any credential has leaked, "
        "<b>regenerate it immediately</b> from the corresponding service's dashboard "
        "and update the project environment variables.",
        note_style,
    ))
    story.append(Spacer(1, 14))

    # === Helper: render a credential section as a table ===
    def section(title_text, rows):
        story.append(Paragraph(title_text, section_style))
        data = []
        for label, value in rows:
            data.append([Paragraph(f"<b>{label}</b>", label_style),
                         Paragraph(value, value_style)])
        tbl = Table(data, colWidths=[45*mm, 120*mm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), white),
            ("BOX", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
            ("INNERGRID", (0, 0), (-1, -1), 0.25, HexColor("#CBD5E1")),
            ("BACKGROUND", (0, 0), (0, -1), COLOR_BG_SOFT),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(tbl)
        story.append(Spacer(1, 8))

    # === 1. TURSO DATABASE ===
    section("1. TURSO DATABASE (libSQL)", [
        ("Service", "Turso — hosted SQLite (libSQL)"),
        ("Database Name", CREDENTIALS.get("TURSO_DB_NAME", "")),
        ("Organization", CREDENTIALS.get("TURSO_ORG", "")),
        ("Region", CREDENTIALS.get("TURSO_REGION", "")),
        ("Database URL", CREDENTIALS.get("TURSO_DATABASE_URL", "")),
        ("Auth Token", CREDENTIALS.get("TURSO_AUTH_TOKEN", "")),
        ("Console URL", "https://app.turso.tech"),
    ])

    # === 2. RESEND EMAIL API ===
    section("2. RESEND (Transactional Email)", [
        ("Service", "Resend — transactional email API"),
        ("API Key", CREDENTIALS.get("RESEND_API_KEY", "")),
        ("From Email", CREDENTIALS.get("RESEND_FROM", "")),
        ("Admin Email", CREDENTIALS.get("RESEND_ADMIN", "")),
        ("Console URL", "https://resend.com/api-keys"),
        ("Note", "Free tier: 3,000 emails/month, 100/day. Verify custom domain to send to any recipient."),
    ])

    # === 3. CLOUDINARY IMAGE STORAGE ===
    section("3. CLOUDINARY (Image Upload & CDN)", [
        ("Service", "Cloudinary — image upload, transformation, CDN"),
        ("Cloud Name", CREDENTIALS.get("CLOUDINARY_CLOUD_NAME", "")),
        ("API Key", CREDENTIALS.get("CLOUDINARY_API_KEY", "")),
        ("API Secret", CREDENTIALS.get("CLOUDINARY_API_SECRET", "")),
        ("Console URL", "https://console.cloudinary.com/console"),
        ("Note", "Free tier: 25 credits/month (~25GB storage + 25GB bandwidth)."),
    ])

    # === 4. VERCEL HOSTING ===
    section("4. VERCEL (Website Hosting)", [
        ("Service", "Vercel — Next.js hosting platform"),
        ("Project URL", CREDENTIALS.get("VERCEL_PROJECT_URL", "")),
        ("Team Slug", CREDENTIALS.get("VERCEL_TEAM_SLUG", "")),
        ("Team ID", CREDENTIALS.get("VERCEL_TEAM_ID", "")),
        ("Project ID", CREDENTIALS.get("VERCEL_PROJECT_ID", "")),
        ("API Token", CREDENTIALS.get("VERCEL_TOKEN", "")),
        ("Token Expiration", CREDENTIALS.get("VERCEL_TOKEN_EXPIRATION", "")),
        ("Token Scope", "eswatini-cars (team-scoped, full access within team)"),
        ("Console URL", "https://vercel.com/eswatini-cars"),
        ("Token Management", "https://vercel.com/account/tokens"),
    ])

    # === 5. APP CONFIGURATION ===
    section("5. APP CONFIGURATION (Auth + Admin)", [
        ("NextAuth Secret", CREDENTIALS.get("NEXTAUTH_SECRET", "")),
        ("NextAuth URL", CREDENTIALS.get("NEXTAUTH_URL", "")),
        ("Admin PIN", CREDENTIALS.get("ADMIN_PIN", "")),
        ("Admin Email Allowlist", CREDENTIALS.get("ADMIN_EMAIL_ALLOWLIST", "")),
        ("Note", "Only emails in the allowlist see the Admin Dashboard button. To add more admins, edit ADMIN_EMAILS in src/app/page.tsx"),
    ])

    # === 6. APK SIGNING KEYSTORE ===
    section("6. APK SIGNING KEYSTORE", [
        ("Keystore Password", CREDENTIALS.get("APK_KEYSTORE_PASSWORD", "")),
        ("Key Alias", CREDENTIALS.get("APK_KEYSTORE_ALIAS", "")),
        ("Certificate DN", CREDENTIALS.get("APK_KEYSTORE_DNAME", "")),
        ("SHA-256 Fingerprint", CREDENTIALS.get("APK_SHA256_FINGERPRINT", "")),
        ("APK Package Name", CREDENTIALS.get("APK_PACKAGE_NAME", "")),
        ("APK App Name", CREDENTIALS.get("APK_APP_NAME", "")),
        ("APK Download Link", CREDENTIALS.get("APK_DOWNLOAD_LINK", "")),
        ("Note", "Keystore file is at /home/z/my-project/android-apk/eswatini-cars.keystore — backup this file too! If you lose it, you can NEVER push updates to the same APK on Google Play."),
    ])

    # === QUICK REFERENCE ===
    story.append(Paragraph("QUICK REFERENCE — Daily URLs", section_style))
    quick_data = [
        [Paragraph("<b>Purpose</b>", label_style), Paragraph("<b>URL</b>", label_style)],
        [Paragraph("Live website", label_style), Paragraph(CREDENTIALS.get("VERCEL_PROJECT_URL", ""), value_style)],
        [Paragraph("API health check", label_style), Paragraph(f"{CREDENTIALS.get('VERCEL_PROJECT_URL', '')}/api/health", value_style)],
        [Paragraph("Listings API", label_style), Paragraph(f"{CREDENTIALS.get('VERCEL_PROJECT_URL', '')}/api/listings", value_style)],
        [Paragraph("Admin stats", label_style), Paragraph(f"{CREDENTIALS.get('VERCEL_PROJECT_URL', '')}/api/admin/stats", value_style)],
        [Paragraph("APK download (GoFile)", label_style), Paragraph(CREDENTIALS.get("APK_DOWNLOAD_LINK", ""), value_style)],
        [Paragraph("Vercel dashboard", label_style), Paragraph("https://vercel.com/eswatini-cars", value_style)],
        [Paragraph("Turso dashboard", label_style), Paragraph("https://app.turso.tech", value_style)],
        [Paragraph("Resend dashboard", label_style), Paragraph("https://resend.com", value_style)],
        [Paragraph("Cloudinary console", label_style), Paragraph("https://console.cloudinary.com", value_style)],
    ]
    quick_table = Table(quick_data, colWidths=[55*mm, 110*mm])
    quick_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), COLOR_PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("BACKGROUND", (0, 1), (-1, -1), white),
        ("BOX", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, HexColor("#CBD5E1")),
        ("BACKGROUND", (0, 1), (0, -1), COLOR_BG_SOFT),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(quick_table)
    story.append(Spacer(1, 16))

    # === LEAK RESPONSE PLAN ===
    story.append(Paragraph("🚨 IF A CREDENTIAL LEAKS — RESPONSE PLAN", warn_style))
    leak_steps = [
        "<b>Turso token leaked:</b> Go to https://app.turso.tech → Settings → API Tokens → Delete the old token → Create new → Update .env.local on Vercel + local → Redeploy.",
        "<b>Resend key leaked:</b> Go to https://resend.com/api-keys → Delete old → Create new → Update .env.local on Vercel.",
        "<b>Cloudinary secret leaked:</b> Go to https://console.cloudinary.com → Settings → API Keys → Revoke old → Create new → Update .env.local on Vercel.",
        "<b>Vercel token leaked:</b> Go to https://vercel.com/account/tokens → Delete the token → Create new with same scope → Use new token for future deploys.",
        "<b>APK keystore leaked:</b> Generate a new keystore with keytool. Update /.well-known/assetlinks.json with the new SHA-256 fingerprint. Rebuild and re-sign the APK. Old APK cannot be updated — users must uninstall + reinstall the new one.",
        "<b>Admin PIN leaked:</b> Edit ADMIN_PIN in src/app/page.tsx → Redeploy. (PIN is checked client-side; for true security, also add server-side session auth in future.)",
    ]
    for i, step in enumerate(leak_steps, 1):
        story.append(Paragraph(f"{i}. {step}", note_style))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 14))

    # === FUTURE IMPROVEMENTS ===
    story.append(Paragraph("FUTURE IMPROVEMENTS", section_style))
    future_steps = [
        "<b>Custom domain:</b> Buy eswatinicars.co.sz (~E200-350/year) → Point DNS to Vercel → Update NEXTAUTH_URL → Verify domain in Resend → Branded emails (noreply@eswatinicars.co.sz).",
        "<b>Real user authentication:</b> Add User model to Prisma with hashed passwords (bcryptjs) + wire NextAuth.js with Prisma adapter. Currently login is client-side only (not secure).",
        "<b>Splash screen:</b> Add branded loading screen (dark navy + gold logo + pulsing dots) to mask the brief URL bar flash on APK launch.",
        "<b>Google Play Store:</b> Submit signed APK to Play Console ($25 one-time fee) → APK updates push automatically to users → no more 'unknown sources' warning for new users.",
        "<b>Server-side auth on API:</b> Currently PATCH/DELETE /api/listings/[id] trust the client. Add NextAuth session check so a determined attacker can't bypass ownership checks.",
        "<b>WhatsApp notifications:</b> Add Twilio or WhatsApp Business API to send broker an instant WhatsApp message when an enquiry arrives.",
    ]
    for i, step in enumerate(future_steps, 1):
        story.append(Paragraph(f"{i}. {step}", note_style))
        story.append(Spacer(1, 4))

    doc.build(story)
    print(f"✅ PDF created successfully at: {OUTPUT_PATH}")
    print(f"   File size: {os.path.getsize(OUTPUT_PATH):,} bytes")

if __name__ == "__main__":
    build_pdf()
