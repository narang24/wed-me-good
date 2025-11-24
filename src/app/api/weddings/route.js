import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch user's weddings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const weddings = await prisma.wedding.findMany({
      where: { userId: session.user.id },
      include: {
        events: { orderBy: { date: 'asc' } },
        _count: {
          select: {
            guests: true,
            bookings: true,
            tasks: true,
            expenses: true
          }
        }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json(weddings)
  } catch (error) {
    console.error('Error fetching weddings:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST - Create new wedding
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, date, venue, budget, events } = await request.json()

    if (!title || !date || !venue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const wedding = await prisma.wedding.create({
      data: {
        title,
        date: new Date(date),
        venue,
        budget: budget || 0,
        userId: session.user.id,
        events: {
          create: events?.map(event => ({
            name: event.name,
            date: new Date(event.date),
            venue: event.venue || null,
            notes: event.notes || null
          })) || []
        }
      },
      include: {
        events: true
      }
    })

    return NextResponse.json(wedding, { status: 201 })
  } catch (error) {
    console.error('Error creating wedding:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}