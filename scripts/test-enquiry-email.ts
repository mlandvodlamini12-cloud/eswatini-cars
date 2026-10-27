// Test the full buyer enquiry email flow
// Simulates a buyer submitting an enquiry on a listing
// Sends: (1) broker notification email to ADMIN_EMAIL, (2) buyer confirmation email
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
const FROM = process.env.EMAIL_FROM!
const ADMIN_EMAIL = process.env.EMAIL_ADMIN!

console.log('=== Email Configuration ===')
console.log(`From: ${FROM}`)
console.log(`Admin (broker) email: ${ADMIN_EMAIL}`)
console.log(`Resend key: ${process.env.RESEND_API_KEY!.slice(0, 8)}...`)
console.log('')

// Simulate buyer enquiry on the Toyota Corolla
const listing = {
  year: 2018,
  make: 'Toyota',
  model: 'Corolla',
  price: 185000,
}
const buyer = {
  name: 'Thabo Mthembu (TEST BUYER)',
  phone: '+268 7612 3456',
  email: ADMIN_EMAIL, // Send buyer confirmation to admin too (free tier only sends to verified email)
  message: 'Hi, I saw the 2018 Toyota Corolla on Eswatini Cars. Is the price still negotiable? I can come view it this weekend.',
}

async function sendBrokerNotification() {
  const subject = `New enquiry: ${listing.year} ${listing.make} ${listing.model}`
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #0F172A; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">New Buyer Enquiry</h2>
        <p style="margin: 6px 0 0; opacity: 0.8;">Eswatini Cars — Broker Dashboard</p>
      </div>
      <div style="background: #F8FAFC; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #E2E8F0;">
        <p><strong>Vehicle:</strong> ${listing.year} ${listing.make} ${listing.model} — E${listing.price.toLocaleString()}</p>
        <p><strong>Buyer name:</strong> ${buyer.name}</p>
        <p><strong>Buyer phone:</strong> ${buyer.phone}</p>
        <p><strong>Buyer email:</strong> ${buyer.email}</p>
        <p style="margin-top: 16px;"><strong>Buyer message:</strong></p>
        <div style="background: white; padding: 12px 16px; border-left: 4px solid #D4A017; margin-top: 8px;">
          ${buyer.message}
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #64748B;">
          Log in to your admin dashboard to reply and arrange a viewing.
        </p>
      </div>
    </div>
  `
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject,
    html,
  })
  if (error) {
    console.error('❌ Broker notification FAILED:', error)
    return
  }
  console.log(`✅ Broker notification sent — Email ID: ${data?.id}`)
  console.log(`   Delivered to: ${ADMIN_EMAIL}`)
}

async function sendBuyerConfirmation() {
  const subject = `We received your enquiry — ${listing.year} ${listing.make} ${listing.model}`
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #0F172A; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h2 style="margin: 0;">Thank you for your enquiry</h2>
      </div>
      <div style="background: #F8FAFC; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #E2E8F0;">
        <p>Hi ${buyer.name.split(' ')[0]},</p>
        <p>We've received your enquiry about <strong>${listing.year} ${listing.make} ${listing.model}</strong>.</p>
        <p>Our broker will contact you within 24 hours to arrange a viewing and answer any questions you may have.</p>
        <p>If you'd like to reach us sooner, call <strong>+268 7600 0000</strong> (Mon-Sat 8am-6pm).</p>
        <p style="margin-top: 24px; font-size: 12px; color: #64748B;">
          Eswatini Cars — Connecting buyers, sellers, and a trusted broker.
        </p>
      </div>
    </div>
  `
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: buyer.email,
    subject,
    html,
  })
  if (error) {
    console.error('❌ Buyer confirmation FAILED:', error)
    return
  }
  console.log(`✅ Buyer confirmation sent — Email ID: ${data?.id}`)
  console.log(`   Delivered to: ${buyer.email}`)
}

async function main() {
  console.log('=== Simulating buyer enquiry on 2018 Toyota Corolla ===\n')
  await sendBrokerNotification()
  await sendBuyerConfirmation()
  console.log('\n=== Done! Check your inbox (and spam folder) at: ===')
  console.log(`   📬 ${ADMIN_EMAIL}`)
  console.log('')
  console.log('You should receive TWO emails:')
  console.log('  1. "New Buyer Enquiry" — broker notification (what you, the broker, will see)')
  console.log('  2. "Thank you for your enquiry" — buyer confirmation (what every buyer sees)')
}

main().catch((e) => { console.error(e); process.exit(1) })
