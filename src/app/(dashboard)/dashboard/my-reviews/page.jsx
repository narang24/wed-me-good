// src/app/(dashboard)/dashboard/my-reviews/page.jsx
'use client'

import { useState, useEffect } from 'react'

const ReviewModal = ({ booking, existingReview, onClose, onSave }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    setSaving(true)
    await onSave(booking.vendorId, rating, comment)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gunmetal">
            {existingReview ? 'Update Review' : 'Write a Review'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gunmetal mb-2">
              {booking.vendor.name}
            </p>
            <p className="text-xs text-gunmetal/60">{booking.vendor.category.name}</p>
          </div>

          <div>
            <label className="input-label">Your Rating *</label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-4xl transition-all hover:scale-110"
                >
                  {star <= (hoveredRating || rating) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gunmetal/60 mt-2">
                {rating === 5 && 'Excellent! 🎉'}
                {rating === 4 && 'Very Good! 👍'}
                {rating === 3 && 'Good 👌'}
                {rating === 2 && 'Could be better 😐'}
                {rating === 1 && 'Needs improvement 😞'}
              </p>
            )}
          </div>

          <div>
            <label className="input-label">Your Review (Optional)</label>
            <textarea
              className="input min-h-[120px]"
              placeholder="Share your experience with this vendor..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : (existingReview ? 'Update Review' : 'Submit Review')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const BookingReviewCard = ({ booking, review, onReview, onDeleteReview }) => {
  return (
    <div className="card border-l-4 border-l-moonstone">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gunmetal text-lg">{booking.vendor.name}</h3>
              <p className="text-sm text-saffron-dark">{booking.vendor.category.name}</p>
            </div>
          </div>

          {review ? (
            <div className="mt-3 p-3 bg-light-blue/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-saffron-dark font-bold">{review.rating}</span>
                <span className="text-saffron-dark">⭐</span>
                <span className="text-xs text-gunmetal/50">
                  • {new Date(review.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-gunmetal/70 italic">"{review.comment}"</p>
              )}
            </div>
          ) : (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gunmetal/60">No review yet</p>
            </div>
          )}
        </div>

        <div className="flex md:flex-col gap-2">
          <button 
            onClick={() => onReview(booking)} 
            className="btn-secondary flex-1 md:flex-none text-sm"
          >
            {review ? '✏️ Edit Review' : '⭐ Write Review'}
          </button>
          {review && (
            <button 
              onClick={() => onDeleteReview(review.id)} 
              className="btn-outline flex-1 md:flex-none text-sm text-red-500 border-red-500 hover:bg-red-50"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MyReviewsPage() {
  const [bookings, setBookings] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch bookings
      const bookingsRes = await fetch('/api/bookings')
      const bookingsData = await bookingsRes.json()
      setBookings(Array.isArray(bookingsData) ? bookingsData : [])

      // Fetch user's reviews
      const reviewsRes = await fetch('/api/reviews')
      const reviewsData = await reviewsRes.json()
      setReviews(Array.isArray(reviewsData) ? reviewsData : [])

    } catch (error) {
      console.error('Error fetching data:', error)
      setBookings([])
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenReviewModal = (booking) => {
    setSelectedBooking(booking)
    setShowReviewModal(true)
  }

  const handleSaveReview = async (vendorId, rating, comment) => {
    try {
      // Check if review exists
      const existingReview = reviews.find(r => r.vendorId === vendorId)
      
      if (existingReview) {
        // Update existing review
        const res = await fetch(`/api/reviews/${existingReview.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating, comment })
        })

        if (!res.ok) {
          const error = await res.json()
          alert(error.error || 'Failed to update review')
          return
        }
      } else {
        // Create new review
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendorId, rating, comment })
        })

        if (!res.ok) {
          const error = await res.json()
          alert(error.error || 'Failed to create review')
          return
        }
      }

      await fetchData()
      setShowReviewModal(false)
      setSelectedBooking(null)
    } catch (error) {
      console.error('Error saving review:', error)
      alert('Something went wrong')
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' })
      
      if (res.ok) {
        await fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Something went wrong')
    }
  }

  const stats = {
    totalBookings: bookings.length,
    totalReviews: reviews.length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0,
    pending: bookings.length - reviews.length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-moonstone" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gunmetal">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">My Reviews</h1>
        <p className="text-gunmetal/60 mt-1">Review vendors you've worked with</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-stat bg-card-blue">
          <p className="text-sm text-gunmetal/60">Total Bookings</p>
          <p className="text-3xl font-bold text-gunmetal">{stats.totalBookings}</p>
        </div>
        <div className="card-stat bg-card-green">
          <p className="text-sm text-gunmetal/60">Reviews Given</p>
          <p className="text-3xl font-bold text-green-600">{stats.totalReviews}</p>
        </div>
        <div className="card-stat bg-card-yellow">
          <p className="text-sm text-gunmetal/60">Avg Rating</p>
          <p className="text-3xl font-bold text-saffron-dark">{stats.avgRating}⭐</p>
        </div>
        <div className="card-stat bg-card-pink">
          <p className="text-sm text-gunmetal/60">Pending</p>
          <p className="text-3xl font-bold text-red-600">{stats.pending}</p>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold text-gunmetal mb-2">No vendors booked yet</h3>
          <p className="text-gunmetal/60 mb-6">Book vendors to leave reviews</p>
          <a href="/dashboard/vendors" className="btn-primary">
            Browse Vendors
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const review = reviews.find(r => r.vendorId === booking.vendorId)
            return (
              <BookingReviewCard
                key={booking.id}
                booking={booking}
                review={review}
                onReview={handleOpenReviewModal}
                onDeleteReview={handleDeleteReview}
              />
            )
          })}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          existingReview={reviews.find(r => r.vendorId === selectedBooking.vendorId)}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedBooking(null)
          }}
          onSave={handleSaveReview}
        />
      )}
    </div>
  )
}