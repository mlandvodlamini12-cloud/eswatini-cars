import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionToken, getSessionCookieName } from '@/lib/session'

// GET /api/admin/stats — admin overview
// SECURITY: Only authenticated admins can access this route.
// Previously had NO auth check — anyone could see business data.
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value
    const session = token ? await verifySessionToken(token) : null
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const [totalListings, activeListings, soldListings, totalEnquiries, newEnquiries, totalViews, messages] = await Promise.all([
      db.listing.count(),
      db.listing.count({ where: { status: 'active' } }),
      db.listing.count({ where: { status: 'sold' } }),
      db.enquiry.count(),
      db.enquiry.count({ where: { status: 'new' } }),
      db.listing.aggregate({ _sum: { views: true } }),
      db.contactMessage.count(),
    ])

    // Top listings by enquiry count
    const topListings = await db.listing.findMany({
      include: { _count: { select: { enquiries: true } } },
      orderBy: { enquiries: { _count: 'desc' } },
      take: 5,
    })

    // Recent enquiries — hide seller phone (private)
    const recentEnquiries = await db.enquiry.findMany({
      include: { listing: { select: { id: true, make: true, model: true, year: true, price: true, region: true } } },
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
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
