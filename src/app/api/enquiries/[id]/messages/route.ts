import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/enquiries/[id]/messages — broker or buyer sends a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  if (!body.text || !body.sender) {
    return NextResponse.json({ error: 'Missing text or sender' }, { status: 400 })
  }

  const validSenders = ['broker', 'buyer']
  if (!validSenders.includes(body.sender)) {
    return NextResponse.json({ error: 'Invalid sender' }, { status: 400 })
  }

  const enquiry = await db.enquiry.findUnique({ where: { id } })
  if (!enquiry) {
    return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })
  }

  const message = await db.message.create({
    data: {
      enquiryId: id,
      sender: body.sender,
      text: body.text,
    },
  })

  // If broker replies, mark enquiry as "contacted"
  if (body.sender === 'broker' && enquiry.status === 'new') {
    await db.enquiry.update({
      where: { id },
      data: { status: 'contacted' },
    })
  }

  return NextResponse.json({ message })
}
