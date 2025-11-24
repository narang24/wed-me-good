import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// PUT - Update booking (payment, status)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paidAmount, paymentStatus, notes } = await request.json()

    // Verify ownership through wedding
    const booking = await prisma.weddingVendor.findUnique({
      where: { id },
      include: { wedding: true }
    })

    if (!booking || booking.wedding.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE - Cancel booking
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const booking = await prisma.weddingVendor.findUnique({
      where: { id },
      include: { wedding: true }
    })

    if (!booking || booking.wedding.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.weddingVendor.delete({ where: { id } })

    return NextResponse.json({ message: 'Booking cancelled successfully' })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}