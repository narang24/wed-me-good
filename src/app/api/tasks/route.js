import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch tasks for user's wedding
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Get user's wedding first
    const wedding = await prisma.wedding.findFirst({
      where: { userId: session.user.id }
    })

    if (!wedding) {
      return NextResponse.json([])
    }

    const tasks = await prisma.task.findMany({
      where: {
        weddingId: wedding.id,
        ...(status && { status })
      },
      orderBy: [
        { status: 'asc' }, // Pending tasks first
        { priority: 'desc' }, // High priority first
        { deadline: 'asc' } // Earliest deadline first
      ]
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST - Add a new task
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, deadline, priority } = await request.json()

    if (!title || !deadline) {
      return NextResponse.json({ error: 'Title and deadline are required' }, { status: 400 })
    }

    // Validate priority
    const priorityValue = parseInt(priority) || 1
    if (priorityValue < 1 || priorityValue > 3) {
      return NextResponse.json({ error: 'Priority must be 1 (Low), 2 (Medium), or 3 (High)' }, { status: 400 })
    }

    // Get user's wedding
    const wedding = await prisma.wedding.findFirst({
      where: { userId: session.user.id }
    })

    if (!wedding) {
      return NextResponse.json({ error: 'Please create a wedding first' }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        deadline: new Date(deadline),
        priority: priorityValue,
        weddingId: wedding.id
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error adding task:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}