// src/app/(dashboard)/dashboard/reviews/page.jsx
'use client'

import { useState, useEffect } from 'react'

const ReviewCard = ({ review }) => {
  const reviewDate = new Date(review.createdAt)
  
  return (
    <div className="card border-l-4 border-l-saffron">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-moonstone flex items-center justify-center text-white font-bold">
              {review.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-semibold text-gunmetal">{review.user.name}</h4>
              <p className="text-xs text-gunmetal/50">
                {reviewDate.toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-saffron/20 px-3 py-1 rounded-lg">
          <span className="text-saffron-dark font-bold">{review.rating}</span>
          <span className="text-saffron-dark">⭐</span>
        </div>
      </div>

      {review.comment && (
        <p className="text-sm text-gunmetal/70 mb-3 pl-13">
          "{review.comment}"
        </p>
      )}

      <div className="pl-13 text-sm text-gunmetal/50">
        For: <span className="font-medium text-gunmetal">{review.vendor.name}</span>
        <span className="mx-2">•</span>
        <span>{review.vendor.category.name}</span>
      </div>
    </div>
  )
}

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState('ALL')
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch vendor's services
      const servicesRes = await fetch('/api/vendors/my-services')
      const servicesData = await servicesRes.json()
      const vendorServices = Array.isArray(servicesData) ? servicesData : []
      setServices(vendorServices)

      if (vendorServices.length === 0) {
        setReviews([])
        setLoading(false)
        return
      }

      // Fetch reviews for all vendor's services
      const vendorIds = vendorServices.map(s => s.id)
      const reviewsPromises = vendorIds.map(id => 
        fetch(`/api/reviews?vendorId=${id}`).then(r => r.json())
      )
      
      const reviewsArrays = await Promise.all(reviewsPromises)
      const allReviews = reviewsArrays.flat()
      setReviews(allReviews)

      // Calculate stats
      if (allReviews.length > 0) {
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        
        setStats({
          total: allReviews.length,
          avgRating: avgRating.toFixed(1),
          fiveStar: allReviews.filter(r => r.rating === 5).length,
          fourStar: allReviews.filter(r => r.rating === 4).length,
          threeStar: allReviews.filter(r => r.rating === 3).length,
          twoStar: allReviews.filter(r => r.rating === 2).length,
          oneStar: allReviews.filter(r => r.rating === 1).length
        })
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      setReviews([])
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  // Filter reviews
  const filteredReviews = selectedService === 'ALL' 
    ? reviews 
    : reviews.filter(r => r.vendorId === selectedService)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-moonstone" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gunmetal">Loading reviews...</span>
        </div>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">My Reviews</h1>
        
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🛠️</div>
          <h3 className="text-xl font-semibold text-gunmetal mb-2">No Services Created Yet</h3>
          <p className="text-gunmetal/60 mb-6">Create a service first to receive reviews</p>
          <a href="/dashboard/services" className="btn-primary">
            Create Service
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">My Reviews</h1>
        <p className="text-gunmetal/60 mt-1">See what clients are saying about your services</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="card-stat bg-card-blue">
          <p className="text-sm text-gunmetal/60">Total Reviews</p>
          <p className="text-3xl font-bold text-gunmetal">{stats.total}</p>
        </div>
        <div className="card-stat bg-card-yellow">
          <p className="text-sm text-gunmetal/60">Avg Rating</p>
          <p className="text-3xl font-bold text-saffron-dark">{stats.avgRating}⭐</p>
        </div>
        <div className="card-stat bg-card-green">
          <p className="text-sm text-gunmetal/60">5 Stars</p>
          <p className="text-3xl font-bold text-green-600">{stats.fiveStar}</p>
        </div>
        <div className="card-stat bg-card-purple">
          <p className="text-sm text-gunmetal/60">4 Stars</p>
          <p className="text-3xl font-bold text-moonstone">{stats.fourStar}</p>
        </div>
        <div className="card-stat bg-card-pink">
          <p className="text-sm text-gunmetal/60">3 Stars</p>
          <p className="text-3xl font-bold text-gunmetal">{stats.threeStar}</p>
        </div>
        <div className="card-stat bg-gray-100">
          <p className="text-sm text-gunmetal/60">1-2 Stars</p>
          <p className="text-3xl font-bold text-red-600">{stats.twoStar + stats.oneStar}</p>
        </div>
      </div>

      {/* Rating Distribution */}
      {reviews.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gunmetal mb-4">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviews.filter(r => r.rating === rating).length
              const percentage = (count / reviews.length) * 100
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-gunmetal/60 w-16">{rating} ⭐</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-saffron rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gunmetal/60 w-12 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="card">
        <div className="flex gap-4">
          <select
            className="input"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="ALL">All Services ({reviews.length})</option>
            {services.map(service => {
              const serviceReviews = reviews.filter(r => r.vendorId === service.id)
              return (
                <option key={service.id} value={service.id}>
                  {service.name} ({serviceReviews.length})
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold text-gunmetal mb-2">No reviews yet</h3>
          <p className="text-gunmetal/60">
            {reviews.length === 0 
              ? 'Reviews will appear here when clients rate your services'
              : 'No reviews for this service yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}