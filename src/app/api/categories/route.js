import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - Fetch all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { vendors: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}