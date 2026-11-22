import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionToken, getSessionCookieName } from '@/lib/session'
import { sendEmail } from '@/lib/email'

// GET /api/backup — exports ALL data as JSON.
// Protected by admin auth OR a cron secret header.
// When called by cron, emails the JSON to the admin.
// When called manually, returns the JSON as a downloadable file.

export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret')
  const isCronCall = cronSecret === process.env.CRON_SECRET

  if (!isCronCall) {
    const token = req.cookies.get(getSessionCookieName())?.value
    if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const session = await verifySessionToken(token)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
  }

  try {
    const [listings, users, enquiries, messages, vehicleRequests, broadcasts, contactMessages] = await Promise.all([
      db.listing.findMany({ include: { enquiries: true } }),
      db.user.findMany({ select: { id: true, email: true, username: true, name: true, phone: true, phoneVerified: true, authProvider: true, role: true, blocked: true, createdAt: true, updatedAt: true } }),
      db.enquiry.findMany(),
      db.message.findMany(),
      db.vehicleRequest.findMany(),
      db.broadcast.findMany(),
      db.contactMessage.findMany({ include: { replies: true } }),
    ])

    const backup = {
      metadata: { exportedAt: new Date().toISOString(), version: '1.0', counts: { listings: listings.length, users: users.length, enquiries: enquiries.length, messages: messages.length, vehicleRequests: vehicleRequests.length, broadcasts: broadcasts.length, contactMessages: contactMessages.length } },
      listings, users, enquiries, messages, vehicleRequests, broadcasts, contactMessages,
    }

    const json = JSON.stringify(backup, null, 2)
    const filename = `eswatini-cars-backup-${new Date().toISOString().split('T')[0]}.json`

    if (isCronCall) {
      const adminEmail = process.env.EMAIL_ADMIN || 'mlandvodlamini12@gmail.com'
      try {
        await sendEmail({
          to: adminEmail,
          subject: `Daily Backup — Eswatini Cars (${backup.metadata.counts.listings} listings, ${backup.metadata.counts.users} users)`,
          html: `<h2>Eswatini Cars Daily Backup</h2><p>Date: ${backup.metadata.exportedAt}</p><ul><li>Listings: ${backup.metadata.counts.listings}</li><li>Users: ${backup.metadata.counts.users}</li><li>Enquiries: ${backup.metadata.counts.enquiries}</li></ul><p>Full JSON backup is attached.</p>`,
          attachments: [{ filename, content: Buffer.from(json).toString('base64') }],
        })
        return NextResponse.json({ success: true, message: 'Backup emailed', counts: backup.metadata.counts })
      } catch (emailErr: any) {
        return NextResponse.json({ success: false, warning: 'Email failed, data in response', error: emailErr?.message, backup })
      }
    }

    return new NextResponse(json, { status: 200, headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="${filename}"` } })
  } catch (err: any) {
    return NextResponse.json({ error: `Backup failed: ${err?.message}` }, { status: 500 })
  }
}
