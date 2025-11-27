import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - Fetch reviews
// If vendorId is provided, get reviews for that vendor
// Otherwise, get reviews written by the logged-in user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')

    let reviews

    if (vendorId) {
      // Get reviews for a specific vendor
      reviews = await prisma.review.findMany({
        where: { vendorId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          vendor: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Get reviews written by the current user
      reviews = await prisma.review.findMany({
        where: { userId: session.user.id },
        include: {
          vendor: {
            include: {
              category: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST - Create a new review
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vendorId, rating, comment } = await request.json()

    // Validation
    if (!vendorId || !rating) {
      return NextResponse.json({ 
        error: 'Vendor ID and rating are required' 
      }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ 
        error: 'Rating must be between 1 and 5' 
      }, { status: 400 })
    }

    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Check if user already reviewed this vendor
    const existingReview = await prisma.review.findUnique({
      where: {
        vendorId_userId: {
          vendorId,
          userId: session.user.id
        }
      }
    })

    if (existingReview) {
      return NextResponse.json({ 
        error: 'You have already reviewed this vendor. Use PUT to update your review.' 
      }, { status: 400 })
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        vendorId,
        userId: session.user.id,
        rating: parseInt(rating),
        comment: comment || null
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

    // Update vendor's average rating
    const allReviews = await prisma.review.findMany({
      where: { vendorId },
      select: { rating: true }
    })

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.vendor.update({
      where: { id: vendorId },
      data: { rating: avgRating }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}