import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch vendor's own services
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Only vendors can access this endpoint' }, { status: 403 })
    }

    // Get vendor's services
    const services = await prisma.vendor.findMany({
      where: { userId: session.user.id },
      include: {
        category: true,
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching vendor services:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST - Create new service
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Only vendors can create services' }, { status: 403 })
    }

    const { name, categoryId, description, cost, contact, email, address, images } = await request.json()

    // Validation
    if (!name || !categoryId || !cost || !contact) {
      return NextResponse.json({ 
        error: 'Name, category, cost, and contact are required' 
      }, { status: 400 })
    }

    if (cost <= 0) {
      return NextResponse.json({ 
        error: 'Cost must be greater than 0' 
      }, { status: 400 })
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Create vendor service
    const service = await prisma.vendor.create({
      data: {
        name,
        categoryId,
        description: description || null,
        cost: parseFloat(cost),
        contact,
        email: email || null,
        address: address || null,
        images: Array.isArray(images) ? images : [],
        rating: 0,
        userId: session.user.id
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}