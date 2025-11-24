import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch RSVP for a guest
export async function GET(request, { params }) {
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
        rsvp: true,
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

    return NextResponse.json(guest.rsvp || { status: 'PENDING' })
  } catch (error) {
    console.error('Error fetching RSVP:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// PUT - Update or create RSVP
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, noOfPersons, message } = await request.json()

    // Validate status
    if (status && !['PENDING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid RSVP status. Must be PENDING, ACCEPTED, or REJECTED' },
        { status: 400 }
      )
    }

    // Validate noOfPersons
    if (noOfPersons !== undefined && (noOfPersons < 1 || !Number.isInteger(noOfPersons))) {
      return NextResponse.json(
        { error: 'Number of persons must be a positive integer' },
        { status: 400 }
      )
    }

    // Verify ownership
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        rsvp: true,
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

    // Check if RSVP exists
    let rsvp

    if (guest.rsvp) {
      // Update existing RSVP
      rsvp = await prisma.rSVP.update({
        where: { guestId: id },
        data: {
          ...(status && { status }),
          ...(noOfPersons !== undefined && { noOfPersons }),
          ...(message !== undefined && { message }),
          respondedAt: new Date()
        }
      })
    } else {
      // Create new RSVP
      rsvp = await prisma.rSVP.create({
        data: {
          guestId: id,
          status: status || 'PENDING',
          noOfPersons: noOfPersons || 1,
          message: message || null,
          respondedAt: new Date()
        }
      })
    }

    // Return updated guest with RSVP
    const updatedGuest = await prisma.guest.findUnique({
      where: { id },
      include: { rsvp: true }
    })

    return NextResponse.json(updatedGuest)
  } catch (error) {
    console.error('Error updating RSVP:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE - Delete RSVP (reset to no response)
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
        rsvp: true,
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

    if (!guest.rsvp) {
      return NextResponse.json({ error: 'No RSVP to delete' }, { status: 404 })
    }

    // Delete RSVP
    await prisma.rSVP.delete({
      where: { guestId: id }
    })

    return NextResponse.json({ message: 'RSVP deleted successfully' })
  } catch (error) {
    console.error('Error deleting RSVP:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}