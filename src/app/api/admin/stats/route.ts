import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/stats — admin overview
export async function GET() {
  const [totalListings, activeListings, soldListings, totalEnquiries, newEnquiries, totalViews, messages] = await Promise.all([
    db.listing.count(),
    db.listing.count({ where: { status: 'active' } }),
    db.listing.count({ where: { status: 'sold' } }),
    db.enquiry.count(),
    db.enquiry.count({ where: { status: 'new' } }),
    db.listing.aggregate({ _sum: { views: true } }),
    db.message.count(),
  ])

  // Top listings by enquiry count
  const topListings = await db.listing.findMany({
    include: { _count: { select: { enquiries: true } } },
    orderBy: { enquiries: { _count: 'desc' } },
    take: 5,
  })

  // Recent enquiries
  const recentEnquiries = await db.enquiry.findMany({
    include: { listing: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return NextResponse.json({
    totals: {
      totalListings,
      activeListings,
      soldListings,
      totalEnquiries,
      newEnquiries,
      totalViews: totalViews._sum.views || 0,
      messages,
    },
    topListings: topListings.map(l => ({
      id: l.id, make: l.make, model: l.model, year: l.year, price: l.price,
      views: l.views, enquiries: (l as any)._count?.enquiries || 0,
    })),
    recentEnquiries,
  })
}
