import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// POST - Bulk import guests
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { guests } = await request.json()

    if (!guests || !Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json({ error: 'Guests array is required' }, { status: 400 })
    }

    // Get user's wedding
    const wedding = await prisma.wedding.findFirst({
      where: { userId: session.user.id }
    })

    if (!wedding) {
      return NextResponse.json({ error: 'Please create a wedding first' }, { status: 400 })
    }

    // Validate all guests have name and email
    for (const guest of guests) {
      if (!guest.name || !guest.email) {
        return NextResponse.json(
          { error: 'Each guest must have a name and email' }, 
          { status: 400 }
        )
      }
    }

    // Get existing emails to avoid duplicates
    const existingGuests = await prisma.guest.findMany({
      where: {
        weddingId: wedding.id,
        email: {
          in: guests.map(g => g.email)
        }
      },
      select: { email: true }
    })

    const existingEmails = new Set(existingGuests.map(g => g.email))

    // Filter out duplicates
    const guestsToCreate = guests
      .filter(g => !existingEmails.has(g.email))
      .map(g => ({
        name: g.name,
        email: g.email,
        phone: g.phone || null,
        address: g.address || null,
        notes: g.notes || null,
        weddingId: wedding.id
      }))

    if (guestsToCreate.length === 0) {
      return NextResponse.json({ 
        error: 'All guests already exist', 
        duplicates: guests.length 
      }, { status: 400 })
    }

    // Bulk create guests
    const result = await prisma.guest.createMany({
      data: guestsToCreate,
      skipDuplicates: true
    })

    return NextResponse.json({
      message: 'Guests imported successfully',
      created: result.count,
      duplicates: guests.length - result.count
    }, { status: 201 })
  } catch (error) {
    console.error('Error bulk importing guests:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}