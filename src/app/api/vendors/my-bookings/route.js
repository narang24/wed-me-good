import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch vendor's bookings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Only vendors can access this endpoint' }, { status: 403 })
    }

    // Get all vendors belonging to this user
    const vendors = await prisma.vendor.findMany({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (vendors.length === 0) {
      return NextResponse.json([])
    }

    const vendorIds = vendors.map(v => v.id)

    // Get all bookings for these vendors
    const bookings = await prisma.weddingVendor.findMany({
      where: {
        vendorId: { in: vendorIds }
      },
      include: {
        vendor: {
          include: { category: true }
        },
        wedding: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: { bookingDate: 'desc' }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching vendor bookings:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}