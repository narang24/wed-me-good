import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch single vendor
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        category: true,
        bookings: {
          include: {
            wedding: {
              select: { title: true, date: true }
            }
          }
        }
      }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// PUT - Update vendor
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, cost, contact, email, address, rating } = await request.json()

    // Check if user owns this vendor or is admin
    const existing = await prisma.vendor.findUnique({ where: { id } })
    
    if (!existing) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    if (session.user.role !== 'ADMIN' && existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(cost && { cost: parseFloat(cost) }),
        ...(contact && { contact }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(rating !== undefined && { rating: parseFloat(rating) })
      },
      include: { category: true }
    })

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE - Delete vendor
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.vendor.findUnique({ where: { id } })
    
    if (!existing) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    if (session.user.role !== 'ADMIN' && existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.vendor.delete({ where: { id } })

    return NextResponse.json({ message: 'Vendor deleted successfully' })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}