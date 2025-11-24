import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// POST - Add event to wedding
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify wedding ownership
    const wedding = await prisma.wedding.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    const { name, date, venue, notes } = await request.json()

    if (!name || !date) {
      return NextResponse.json({ error: 'Name and date are required' }, { status: 400 })
    }

    const event = await prisma.weddingEvent.create({
      data: {
        name,
        date: new Date(date),
        venue: venue || null,
        notes: notes || null,
        weddingId: id
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE - Remove event
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // Verify wedding ownership
    const wedding = await prisma.wedding.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    await prisma.weddingEvent.delete({
      where: { id: eventId }
    })

    return NextResponse.json({ message: 'Event deleted' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}