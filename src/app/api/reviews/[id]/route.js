import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch single review
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        vendor: {
          include: {
            category: true
          }
        }
      }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// PUT - Update review
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rating, comment } = await request.json()

    // Verify ownership
    const existingReview = await prisma.review.findUnique({
      where: { id }
    })

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json({ 
        error: 'You can only update your own reviews' 
      }, { status: 401 })
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json({ 
        error: 'Rating must be between 1 and 5' 
      }, { status: 400 })
    }

    // Update review
    const review = await prisma.review.update({
      where: { id },
      data: {
        ...(rating !== undefined && { rating: parseInt(rating) }),
        ...(comment !== undefined && { comment })
      },
      include: {
        vendor: {
          include: {
            category: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Recalculate vendor's average rating
    const allReviews = await prisma.review.findMany({
      where: { vendorId: existingReview.vendorId },
      select: { rating: true }
    })

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.vendor.update({
      where: { id: existingReview.vendorId },
      data: { rating: avgRating }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE - Delete review
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const review = await prisma.review.findUnique({
      where: { id }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (review.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'You can only delete your own reviews' 
      }, { status: 401 })
    }

    const vendorId = review.vendorId

    // Delete review
    await prisma.review.delete({ where: { id } })

    // Recalculate vendor's average rating
    const remainingReviews = await prisma.review.findMany({
      where: { vendorId },
      select: { rating: true }
    })

    if (remainingReviews.length > 0) {
      const avgRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { rating: avgRating }
      })
    } else {
      // Reset to 0 if no reviews left
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { rating: 0 }
      })
    }

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}