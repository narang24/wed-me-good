import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch guests for user's wedding
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

    const guests = await prisma.guest.findMany({
      where: { weddingId: wedding.id },
      include: {
        rsvp: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(guests)
  } catch (error) {
    console.error('Error fetching guests:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST - Add a new guest
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, phone, address, notes } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Get user's wedding
    const wedding = await prisma.wedding.findFirst({
      where: { userId: session.user.id }
    })

    if (!wedding) {
      return NextResponse.json({ error: 'Please create a wedding first' }, { status: 400 })
    }

    // Check if guest with this email already exists for this wedding
    const existingGuest = await prisma.guest.findFirst({
      where: {
        weddingId: wedding.id,
        email: email
      }
    })

    if (existingGuest) {
      return NextResponse.json({ error: 'Guest with this email already exists' }, { status: 400 })
    }

    const guest = await prisma.guest.create({
      data: {
        name,
        email,
        phone: phone || null,
        address: address || null,
        notes: notes || null,
        weddingId: wedding.id
      },
      include: {
        rsvp: true
      }
    })

    return NextResponse.json(guest, { status: 201 })
  } catch (error) {
    console.error('Error adding guest:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}