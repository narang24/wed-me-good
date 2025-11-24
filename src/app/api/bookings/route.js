import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch bookings for user's wedding
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's wedding first
    const wedding = await prisma.wedding.findFirst({
      where: { userId: session.user.id }
    })

    if (!wedding) {
      return NextResponse.json([])
    }

    const bookings = await prisma.weddingVendor.findMany({
      where: { weddingId: wedding.id },
      include: {
        vendor: {
          include: { category: true }
        }
      },
      orderBy: { bookingDate: 'desc' }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST - Book a vendor
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vendorId, amount, notes } = await request.json()

    if (!vendorId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user's wedding
    const wedding = await prisma.wedding.findFirst({
      where: { userId: session.user.id }
    })

    if (!wedding) {
      return NextResponse.json({ error: 'Please create a wedding first' }, { status: 400 })
    }

    // Check if already booked
    const existing = await prisma.weddingVendor.findUnique({
      where: {
        weddingId_vendorId: {
          weddingId: wedding.id,
          vendorId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Vendor already booked for this wedding' }, { status: 400 })
    }

    const booking = await prisma.weddingVendor.create({
      data: {
        weddingId: wedding.id,
        vendorId,
        amount: parseFloat(amount),
        notes: notes || null
      },
      include: {
        vendor: {
          include: { category: true }
        }
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error booking vendor:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}