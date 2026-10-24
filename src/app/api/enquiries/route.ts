import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEnquiryNotification, sendBuyerConfirmation, ADMIN_EMAIL } from '@/lib/email'

// POST /api/enquiries — buyer submits an enquiry on a listing
// NOTE: All enquiries go DIRECTLY to admin (broker), never to the seller.
// The broker handles all negotiation, then arranges a 3-party meetup.
export async function POST(req: NextRequest) {
  const body = await req.json()

  const required = ['listingId', 'buyerName', 'buyerPhone', 'message']
  for (const f of required) {
    if (!body[f]) {
      return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 })
    }
  }

  // Verify the listing exists and is active
  const listing = await db.listing.findUnique({
    where: { id: body.listingId },
  })

  if (!listing || listing.status !== 'active') {
    return NextResponse.json({ error: 'Listing not available' }, { status: 404 })
  }

  const enquiry = await db.enquiry.create({
    data: {
      listingId: body.listingId,
      buyerName: body.buyerName,
      buyerPhone: body.buyerPhone,
      buyerEmail: body.buyerEmail || null,
      message: body.message,
      status: 'new',
    },
  })

  // Fire-and-forget email notifications (won't fail the request if email is unconfigured)
  const listingTitle = `${listing.year} ${listing.make} ${listing.model}`
  if (ADMIN_EMAIL) {
    sendEnquiryNotification({
      brokerEmail: ADMIN_EMAIL,
      buyerName: body.buyerName,
      buyerPhone: body.buyerPhone,
      listingTitle,
      message: body.message,
    }).catch((e) => console.error('[email] broker notification failed:', e))
  }
  if (body.buyerEmail) {
    sendBuyerConfirmation({
      buyerEmail: body.buyerEmail,
      buyerName: body.buyerName,
      listingTitle,
    }).catch((e) => console.error('[email] buyer confirmation failed:', e))
  }

  return NextResponse.json({
    enquiry,
    message: 'Enquiry sent to ESWATINI CARS. Our broker will contact you within 24 hours.',
  })
}
