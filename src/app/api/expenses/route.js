import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch expenses for user's wedding
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    // Get user's wedding first
    const wedding = await prisma.wedding.findFirst({
      where: { userId: session.user.id }
    })

    if (!wedding) {
      return NextResponse.json([])
    }

    const expenses = await prisma.expense.findMany({
      where: {
        weddingId: wedding.id,
        ...(categoryId && { categoryId })
      },
      include: {
        category: true
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST - Add a new expense
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { categoryId, amount, remarks, date } = await request.json()

    if (!categoryId || !amount) {
      return NextResponse.json({ error: 'Category and amount are required' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    // Get user's wedding
    const wedding = await prisma.wedding.findFirst({
      where: { userId: session.user.id }
    })

    if (!wedding) {
      return NextResponse.json({ error: 'Please create a wedding first' }, { status: 400 })
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        weddingId: wedding.id,
        categoryId,
        amount: parseFloat(amount),
        remarks: remarks || null,
        date: date ? new Date(date) : new Date()
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error adding expense:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}