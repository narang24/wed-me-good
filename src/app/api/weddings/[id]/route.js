import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch single wedding
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wedding = await prisma.wedding.findFirst({
      where: { 
        id,
        userId: session.user.id 
      },
      include: {
        events: { orderBy: { date: 'asc' } },
        guests: { include: { rsvp: true } },
        bookings: { include: { vendor: { include: { category: true } } } },
        tasks: { orderBy: { deadline: 'asc' } },
        expenses: { include: { category: true } }
      }
    })

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    return NextResponse.json(wedding)
  } catch (error) {
    console.error('Error fetching wedding:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// PUT - Update wedding
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, date, venue, budget } = await request.json()

    // Check ownership
    const existing = await prisma.wedding.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    const wedding = await prisma.wedding.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(date && { date: new Date(date) }),
        ...(venue && { venue }),
        ...(budget !== undefined && { budget })
      },
      include: { events: true }
    })

    return NextResponse.json(wedding)
  } catch (error) {
    console.error('Error updating wedding:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE - Delete wedding
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check ownership
    const existing = await prisma.wedding.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    await prisma.wedding.delete({ where: { id } })

    return NextResponse.json({ message: 'Wedding deleted successfully' })
  } catch (error) {
    console.error('Error deleting wedding:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}