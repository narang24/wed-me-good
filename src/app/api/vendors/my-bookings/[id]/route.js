import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch single booking
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Only vendors can access this endpoint' }, { status: 403 })
    }

    const booking = await prisma.weddingVendor.findUnique({
      where: { id },
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
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify that this booking belongs to the vendor's service
    if (booking.vendor.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// PUT - Update booking (payment status, paid amount)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Only vendors can update bookings' }, { status: 403 })
    }

    const { paidAmount, paymentStatus, notes } = await request.json()

    // Verify ownership through vendor
    const booking = await prisma.weddingVendor.findUnique({
      where: { id },
      include: { 
        vendor: true 
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.vendor.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate paidAmount if provided
    if (paidAmount !== undefined) {
      const amount = parseFloat(paidAmount)
      if (amount < 0 || amount > booking.amount) {
        return NextResponse.json({ 
          error: 'Paid amount must be between 0 and total amount' 
        }, { status: 400 })
      }
    }

    // Validate paymentStatus if provided
    if (paymentStatus && !['PENDING', 'PARTIAL', 'COMPLETED'].includes(paymentStatus)) {
      return NextResponse.json({ 
        error: 'Invalid payment status' 
      }, { status: 400 })
    }

    const updated = await prisma.weddingVendor.update({
      where: { id },
      data: {
        ...(paidAmount !== undefined && { paidAmount: parseFloat(paidAmount) }),
        ...(paymentStatus && { paymentStatus }),
        ...(notes !== undefined && { notes })
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
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}