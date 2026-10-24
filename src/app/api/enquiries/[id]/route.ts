import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/enquiries/[id] — fetch full enquiry with messages + listing + seller contact
// (Admin only — used by broker to see everything about an enquiry)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const enquiry = await db.enquiry.findUnique({
    where: { id },
    include: {
      listing: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!enquiry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ enquiry })
}

// PATCH /api/enquiries/[id] — update status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const validStatuses = ['new', 'contacted', 'viewing', 'sold', 'lost']
  if (!validStatuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updated = await db.enquiry.update({
    where: { id },
    data: { status: body.status },
  })

  // If status is "sold", mark the listing as sold
  if (body.status === 'sold') {
    await db.listing.update({
      where: { id: updated.listingId },
      data: { status: 'sold' },
    })
  }

  return NextResponse.json({ enquiry: updated })
}
