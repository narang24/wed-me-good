import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch single service
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = await prisma.vendor.findUnique({
      where: { id },
      include: {
        category: true,
        bookings: {
          include: {
            wedding: {
              select: { title: true, date: true }
            }
          }
        },
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Verify ownership
    if (service.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// PUT - Update service
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Only vendors can update services' }, { status: 403 })
    }

    const { name, categoryId, description, cost, contact, email, address, images, rating } = await request.json()

    // Verify ownership
    const existingService = await prisma.vendor.findUnique({
      where: { id }
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (existingService.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate cost if provided
    if (cost !== undefined && cost <= 0) {
      return NextResponse.json({ 
        error: 'Cost must be greater than 0' 
      }, { status: 400 })
    }

    // Verify category if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      }
    }

    // Update service
    const service = await prisma.vendor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(categoryId && { categoryId }),
        ...(description !== undefined && { description }),
        ...(cost !== undefined && { cost: parseFloat(cost) }),
        ...(contact && { contact }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(images !== undefined && { images: Array.isArray(images) ? images : [] }),
        ...(rating !== undefined && { rating: parseFloat(rating) })
      },
      include: {
        category: true,
        _count: {
          select: { bookings: true }
        }
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE - Delete service
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Only vendors can delete services' }, { status: 403 })
    }

    // Verify ownership
    const service = await prisma.vendor.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (service.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if service has active bookings
    if (service._count.bookings > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete service with active bookings' 
      }, { status: 400 })
    }

    await prisma.vendor.delete({ where: { id } })

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}