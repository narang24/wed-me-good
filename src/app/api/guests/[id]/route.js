import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch single guest
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        rsvp: true,
        wedding: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        }
      }
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Verify ownership
    if (guest.wedding.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(guest)
  } catch (error) {
    console.error('Error fetching guest:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// PUT - Update guest
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, phone, address, notes } = await request.json()

    // Verify ownership
    const existingGuest = await prisma.guest.findUnique({
      where: { id },
      include: {
        wedding: {
          select: { userId: true }
        }
      }
    })

    if (!existingGuest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    if (existingGuest.wedding.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if email is being changed to an existing email
    if (email && email !== existingGuest.email) {
      const emailExists = await prisma.guest.findFirst({
        where: {
          email,
          weddingId: existingGuest.weddingId,
          NOT: { id }
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Another guest with this email already exists' },
          { status: 400 }
        )
      }
    }

    const guest = await prisma.guest.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(notes !== undefined && { notes })
      },
      include: {
        rsvp: true
      }
    })

    return NextResponse.json(guest)
  } catch (error) {
    console.error('Error updating guest:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE - Delete guest
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        wedding: {
          select: { userId: true }
        }
      }
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    if (guest.wedding.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete guest (RSVP will be cascade deleted)
    await prisma.guest.delete({ where: { id } })

    return NextResponse.json({ message: 'Guest deleted successfully' })
  } catch (error) {
    console.error('Error deleting guest:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}