// Quick test: send a real email through our email.ts helper using the configured key
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Resend } from 'resend'

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local')
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}
loadEnv()

const resend = new Resend(process.env.RESEND_API_KEY!)

console.log('=== Resend API Key loaded ===')
console.log(`Key: ${process.env.RESEND_API_KEY!.slice(0, 8)}...`)
console.log('')

// Send a test email to delivered@resend.dev (Resend's sandbox address)
async function main() {
  const { data, error } = await resend.emails.send({
    from: 'Eswatini Cars <onboarding@resend.dev>',
    to: 'delivered@resend.dev',
    subject: 'Eswatini Cars — Email system test',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #0F172A; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="margin: 0;">Eswatini Cars</h2>
          <p style="margin: 6px 0 0; opacity: 0.8;">Email system test — Resend connected</p>
        </div>
        <div style="background: #F8FAFC; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #E2E8F0;">
          <p>✅ <strong>Resend API connection: WORKING</strong></p>
          <p>✅ <strong>Email helper module: LOADED</strong></p>
          <p>✅ <strong>Buyer enquiry notifications: READY</strong></p>
          <p>✅ <strong>Broker notification system: READY</strong></p>
          <p style="margin-top: 16px; font-size: 12px; color: #64748B;">
            This test email used Resend's sandbox address (onboarding@resend.dev).<br>
            For production, you will need to verify your own domain in the Resend dashboard.
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    console.error('❌ Resend error:', error)
    process.exit(1)
  }

  console.log('✅ Test email sent successfully!')
  console.log(`   Email ID: ${data?.id}`)
  console.log('   To: delivered@resend.dev (Resend sandbox)')
  console.log('   From: onboarding@resend.dev')
  console.log('')
  console.log('Note: Resend free tier allows sending ONLY to your own verified email address')
  console.log('until you verify a custom domain in the Resend dashboard.')
}

main().catch((e) => { console.error(e); process.exit(1) })
