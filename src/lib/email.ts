// Resend email helper
// Usage:
//   import { sendEmail, sendEnquiryNotification, sendWelcomeEmail } from '@/lib/email'

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

if (!resend) {
  console.warn('[resend] RESEND_API_KEY not set — emails will be logged only')
}

const FROM = process.env.EMAIL_FROM || 'Eswatini Cars <noreply@eswatinicars.com>'
const ADMIN_EMAIL = process.env.EMAIL_ADMIN || ''

export interface EmailResult {
  id: string
  to: string
  status: string
}

/**
 * Send a basic email. Falls back to console.log if Resend isn't configured.
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
): Promise<EmailResult> {
  if (!resend) {
    console.log(`[email:dev] To: ${to}\nSubject: ${subject}\n---\n${html}\n---`)
    return { id: 'dev-mode', to: Array.isArray(to) ? to.join(',') : to, status: 'dev' }
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  })

  if (error) {
    console.error('[resend] send error:', error)
    throw error
  }

  return {
    id: data?.id || 'unknown',
    to: Array.isArray(to) ? to.join(',') : to,
    status: 'sent',
  }
}

/**
 * Send notification to the broker (admin) when a new enquiry arrives.
 */
export async function sendEnquiryNotification(opts: {
  brokerEmail: string
  buyerName: string
  buyerPhone: string
  listingTitle: string
  message: string
}) {
  const subject = `New enquiry: ${opts.listingTitle}`
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #0F172A; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">New Buyer Enquiry</h2>
        <p style="margin: 6px 0 0; opacity: 0.8;">Eswatini Cars — Broker Dashboard</p>
      </div>
      <div style="background: #F8FAFC; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #E2E8F0;">
        <p><strong>Vehicle:</strong> ${opts.listingTitle}</p>
        <p><strong>Buyer name:</strong> ${opts.buyerName}</p>
        <p><strong>Buyer phone:</strong> ${opts.buyerPhone}</p>
        <p style="margin-top: 16px;"><strong>Buyer message:</strong></p>
        <div style="background: white; padding: 12px 16px; border-left: 4px solid #D4A017; margin-top: 8px;">
          ${opts.message.replace(/\n/g, '<br>')}
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #64748B;">
          Log in to your admin dashboard to reply and arrange a viewing.
        </p>
      </div>
    </div>
  `
  return sendEmail(opts.brokerEmail, subject, html)
}

/**
 * Send a confirmation email to the buyer that their enquiry was received.
 */
export async function sendBuyerConfirmation(opts: {
  buyerEmail: string
  buyerName: string
  listingTitle: string
}) {
  const subject = `We received your enquiry — ${opts.listingTitle}`
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #0F172A; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h2 style="margin: 0;">Thank you for your enquiry</h2>
      </div>
      <div style="background: #F8FAFC; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #E2E8F0;">
        <p>Hi ${opts.buyerName},</p>
        <p>We've received your enquiry about <strong>${opts.listingTitle}</strong>.</p>
        <p>Our broker will contact you within 24 hours to arrange a viewing and answer any questions you may have.</p>
        <p>If you'd like to reach us sooner, call <strong>+268 7600 0000</strong> (Mon-Sat 8am-6pm).</p>
        <p style="margin-top: 24px; font-size: 12px; color: #64748B;">
          Eswatini Cars — Connecting buyers, sellers, and a trusted broker.
        </p>
      </div>
    </div>
  `
  return sendEmail(opts.buyerEmail, subject, html)
}

/**
 * Send a welcome email when a new user registers.
 */
export async function sendWelcomeEmail(opts: {
  email: string
  name: string
  verificationUrl?: string
}) {
  const subject = 'Welcome to Eswatini Cars'
  const verifyBlock = opts.verificationUrl
    ? `<p style="text-align: center; margin: 24px 0;">
         <a href="${opts.verificationUrl}" style="background: #D4A017; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify my email</a>
       </p>
       <p style="font-size: 12px; color: #64748B; text-align: center;">This link expires in 24 hours.</p>`
    : ''
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #0F172A; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h2 style="margin: 0;">Welcome to Eswatini Cars</h2>
      </div>
      <div style="background: #F8FAFC; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #E2E8F0;">
        <p>Hi ${opts.name},</p>
        <p>Your account has been created. You can now save favourite listings, message the broker, and track your enquiries all in one place.</p>
        ${verifyBlock}
        <p style="margin-top: 24px; font-size: 12px; color: #64748B;">
          Eswatini Cars — Connecting buyers, sellers, and a trusted broker.
        </p>
      </div>
    </div>
  `
  return sendEmail(opts.email, subject, html)
}

export { ADMIN_EMAIL }
