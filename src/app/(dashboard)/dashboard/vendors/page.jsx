'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const VendorCard = ({ vendor, onBook, isBooked }) => {
  const [showBookModal, setShowBookModal] = useState(false)
  const [amount, setAmount] = useState(vendor.cost.toString())
  const [notes, setNotes] = useState('')
  const [booking, setBooking] = useState(false)

  const handleBook = async (e) => {
    e.preventDefault()
    setBooking(true)
    await onBook(vendor.id, amount, notes)
    setBooking(false)
    setShowBookModal(false)
  }

  return (
    <>
      <div className="card hover:shadow-lg transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gunmetal text-lg">{vendor.name}</h3>
            <p className="text-sm text-saffron-dark font-medium">{vendor.category.name}</p>
          </div>
          <div className="flex items-center gap-1 bg-saffron/20 px-2 py-1 rounded-lg">
            <span className="text-saffron-dark font-semibold">{vendor.rating.toFixed(1)}</span>
            <span className="text-sm">⭐</span>
          </div>
        </div>

        {vendor.description && (
          <p className="text-sm text-gunmetal/60 mb-4 line-clamp-2">{vendor.description}</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gunmetal/70">
            <span>💰</span>
            <span className="font-semibold text-gunmetal">₹{vendor.cost.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gunmetal/70">
            <span>📞</span>
            <span>{vendor.contact}</span>
          </div>
          {vendor.address && (
            <div className="flex items-center gap-2 text-sm text-gunmetal/70">
              <span>📍</span>
              <span className="truncate">{vendor.address}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {isBooked ? (
            <button disabled className="btn-secondary flex-1 opacity-50 cursor-not-allowed">
              ✓ Already Booked
            </button>
          ) : (
            <button onClick={() => setShowBookModal(true)} className="btn-primary flex-1">
              Book Now
            </button>
          )}
          <Link 
            href={`/dashboard/vendors/${vendor.id}`} 
            className="btn-outline px-4"
          >
            View
          </Link>
        </div>
      </div>

      {/* Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBookModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gunmetal">Book {vendor.name}</h3>
              <button onClick={() => setShowBookModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                ✕
              </button>
            </div>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="input-label">Booking Amount (₹)</label>
                <input
                  type="number"
                  className="input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-gunmetal/50 mt-1">Base price: ₹{vendor.cost.toLocaleString()}</p>
              </div>
              <div>
                <label className="input-label">Notes (Optional)</label>
                <textarea
                  className="input min-h-[80px]"
                  placeholder="Any special requirements or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowBookModal(false)} className="btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={booking} className="btn-primary flex-1">
                  {booking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState([])
  const [categories, setCategories] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('browse') // browse or booked

  useEffect(() => {
    fetchData()
  }, [selectedCategory])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch vendors
      const vendorsUrl = selectedCategory 
        ? `/api/vendors?categoryId=${selectedCategory}` 
        : '/api/vendors'
      const vendorsRes = await fetch(vendorsUrl)
      const vendorsData = await vendorsRes.json()
      
      // FIX: Handle different response formats
      if (Array.isArray(vendorsData)) {
        setVendors(vendorsData)
      } else if (vendorsData.vendors && Array.isArray(vendorsData.vendors)) {
        setVendors(vendorsData.vendors)
      } else {
        console.error('Unexpected vendors data format:', vendorsData)
        setVendors([])
      }

      // Fetch categories
      const categoriesRes = await fetch('/api/categories')
      const categoriesData = await categoriesRes.json()
      
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData)
      } else if (categoriesData.categories && Array.isArray(categoriesData.categories)) {
        setCategories(categoriesData.categories)
      } else {
        setCategories([])
      }

      // Fetch bookings
      const bookingsRes = await fetch('/api/bookings')
      const bookingsData = await bookingsRes.json()
      
      if (Array.isArray(bookingsData)) {
        setBookings(bookingsData)
      } else if (bookingsData.bookings && Array.isArray(bookingsData.bookings)) {
        setBookings(bookingsData.bookings)
      } else {
        setBookings([])
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      setVendors([])
      setCategories([])
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleBookVendor = async (vendorId, amount, notes) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, amount, notes })
      })

      if (res.ok) {
        await fetchData() // Refresh data
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to book vendor')
      }
    } catch (error) {
      console.error('Error booking vendor:', error)
      alert('Something went wrong')
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
    }
  }

  const handleUpdatePayment = async (bookingId, paidAmount, paymentStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paidAmount, paymentStatus })
      })

      if (res.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error updating payment:', error)
    }
  }

  const bookedVendorIds = bookings.map(b => b.vendorId)
  
  // FIX: Ensure vendors is always an array before filtering
  const filteredVendors = Array.isArray(vendors) ? vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-moonstone" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gunmetal">Loading vendors...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">Vendor Management</h1>
        <p className="text-gunmetal/60 mt-1">Browse and book vendors for your wedding</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'browse'
              ? 'text-moonstone border-b-2 border-moonstone'
              : 'text-gunmetal/60 hover:text-gunmetal'
          }`}
        >
          Browse Vendors
        </button>
        <button
          onClick={() => setActiveTab('booked')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'booked'
              ? 'text-moonstone border-b-2 border-moonstone'
              : 'text-gunmetal/60 hover:text-gunmetal'
          }`}
        >
          My Bookings <span className="badge badge-info ml-2">{bookings.length}</span>
        </button>
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* Filters */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <select
                  className="input"
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat._count?.vendors ? `(${cat._count.vendors})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Vendors Grid */}
          {filteredVendors.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gunmetal mb-2">No vendors found</h3>
              <p className="text-gunmetal/60">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map(vendor => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onBook={handleBookVendor}
                  isBooked={bookedVendorIds.includes(vendor.id)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Booked Vendors */}
          {bookings.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gunmetal mb-2">No bookings yet</h3>
              <p className="text-gunmetal/60 mb-6">Start booking vendors from the browse tab</p>
              <button onClick={() => setActiveTab('browse')} className="btn-primary">
                Browse Vendors
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                  onUpdatePayment={handleUpdatePayment}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Booking Card Component
function BookingCard({ booking, onCancel, onUpdatePayment }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paidAmount, setPaidAmount] = useState(booking.paidAmount.toString())
  const [paymentStatus, setPaymentStatus] = useState(booking.paymentStatus)

  const handleUpdatePayment = async (e) => {
    e.preventDefault()
    await onUpdatePayment(booking.id, parseFloat(paidAmount), paymentStatus)
    setShowPaymentModal(false)
  }

  const remaining = booking.amount - booking.paidAmount
  const paymentPercentage = Math.round((booking.paidAmount / booking.amount) * 100)

  return (
    <>
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gunmetal text-lg">{booking.vendor.name}</h3>
                <p className="text-sm text-saffron-dark">{booking.vendor.category.name}</p>
              </div>
              <span className={`badge ${
                booking.paymentStatus === 'COMPLETED' ? 'badge-success' :
                booking.paymentStatus === 'PARTIAL' ? 'badge-warning' :
                'badge-danger'
              }`}>
                {booking.paymentStatus}
              </span>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gunmetal/60">Total Amount:</span>
                <span className="font-semibold text-gunmetal">₹{booking.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gunmetal/60">Paid:</span>
                <span className="text-green-600 font-semibold">₹{booking.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gunmetal/60">Remaining:</span>
                <span className="text-red-600 font-semibold">₹{remaining.toLocaleString()}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: `${paymentPercentage}%` }} />
              </div>
              <p className="text-xs text-gunmetal/50 text-right">{paymentPercentage}% paid</p>
            </div>

            {booking.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gunmetal/70">📝 {booking.notes}</p>
              </div>
            )}
          </div>

          <div className="flex md:flex-col gap-2">
            <button onClick={() => setShowPaymentModal(true)} className="btn-secondary flex-1 md:flex-none">
              Update Payment
            </button>
            <button onClick={() => onCancel(booking.id)} className="btn-outline flex-1 md:flex-none text-red-500 border-red-500 hover:bg-red-50">
              Cancel Booking
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPaymentModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gunmetal">Update Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdatePayment} className="space-y-4">
              <div>
                <label className="input-label">Paid Amount (₹)</label>
                <input
                  type="number"
                  className="input"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  max={booking.amount}
                  required
                />
              </div>
              <div>
                <label className="input-label">Payment Status</label>
                <select
                  className="input"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}