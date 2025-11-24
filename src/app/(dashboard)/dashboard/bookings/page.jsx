'use client'

import { useState, useEffect } from 'react'

const BookingCard = ({ booking, onUpdateStatus, onUpdatePayment }) => {
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [status, setStatus] = useState(booking.paymentStatus)
  const [paidAmount, setPaidAmount] = useState(booking.paidAmount.toString())

  const weddingDate = new Date(booking.wedding.date)
  const bookingDate = new Date(booking.bookingDate)
  const remaining = booking.amount - booking.paidAmount
  const paymentPercentage = Math.round((booking.paidAmount / booking.amount) * 100)
  
  const statusColors = {
    PENDING: 'badge-warning',
    PARTIAL: 'badge-info',
    COMPLETED: 'badge-success'
  }

  const handleUpdateStatus = async () => {
    await onUpdateStatus(booking.id, status)
    setShowStatusModal(false)
  }

  const handleUpdatePayment = async () => {
    await onUpdatePayment(booking.id, parseFloat(paidAmount), status)
    setShowPaymentModal(false)
  }

  return (
    <>
      <div className="card border-l-4 border-l-moonstone">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gunmetal text-lg">{booking.wedding.title}</h3>
                <p className="text-sm text-saffron-dark">{booking.vendor.name}</p>
                <p className="text-xs text-gunmetal/50 mt-1">{booking.vendor.category.name}</p>
              </div>
              <span className={`badge ${statusColors[booking.paymentStatus]}`}>
                {booking.paymentStatus}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gunmetal/70">
                <span>📅</span>
                <span>Wedding: {weddingDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 text-gunmetal/70">
                <span>🔖</span>
                <span>Booked: {bookingDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {booking.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gunmetal/70">📝 {booking.notes}</p>
              </div>
            )}
          </div>

          <div className="md:w-64 space-y-3">
            <div className="p-4 bg-light-blue/20 rounded-xl">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gunmetal/60">Total Amount:</span>
                  <span className="font-semibold text-gunmetal">₹{booking.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gunmetal/60">Received:</span>
                  <span className="text-green-600 font-semibold">₹{booking.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gunmetal/60">Pending:</span>
                  <span className="text-red-600 font-semibold">₹{remaining.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="progress-bar mt-3">
                <div className="progress-fill" style={{ width: `${paymentPercentage}%` }} />
              </div>
              <p className="text-xs text-gunmetal/50 text-right mt-1">{paymentPercentage}% paid</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowStatusModal(true)} 
                className="btn-secondary flex-1 text-sm"
              >
                Update Status
              </button>
              <button 
                onClick={() => setShowPaymentModal(true)} 
                className="btn-outline text-sm px-4"
              >
                💰
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <Modal title="Update Payment Status" onClose={() => setShowStatusModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="input-label">Payment Status</label>
              <select
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowStatusModal(false)} className="btn-outline flex-1">
                Cancel
              </button>
              <button onClick={handleUpdateStatus} className="btn-primary flex-1">
                Update
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <Modal title="Update Payment" onClose={() => setShowPaymentModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="input-label">Amount Received (₹)</label>
              <input
                type="number"
                className="input"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                max={booking.amount}
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gunmetal/50 mt-1">
                Total: ₹{booking.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="input-label">Payment Status</label>
              <select
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowPaymentModal(false)} className="btn-outline flex-1">
                Cancel
              </button>
              <button onClick={handleUpdatePayment} className="btn-primary flex-1">
                Update Payment
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/vendors/my-bookings')
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setBookings(data)
      } else if (data.bookings && Array.isArray(data.bookings)) {
        setBookings(data.bookings)
      } else {
        setBookings([])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`/api/vendors/my-bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status })
      })

      if (res.ok) {
        await fetchBookings()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Something went wrong')
    }
  }

  const handleUpdatePayment = async (bookingId, paidAmount, paymentStatus) => {
    try {
      const res = await fetch(`/api/vendors/my-bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paidAmount, paymentStatus })
      })

      if (res.ok) {
        await fetchBookings()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update payment')
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      alert('Something went wrong')
    }
  }

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.wedding.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         b.vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'ALL' || b.paymentStatus === filterStatus
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.paymentStatus === 'PENDING').length,
    partial: bookings.filter(b => b.paymentStatus === 'PARTIAL').length,
    completed: bookings.filter(b => b.paymentStatus === 'COMPLETED').length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.amount, 0),
    receivedRevenue: bookings.reduce((sum, b) => sum + b.paidAmount, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-moonstone" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gunmetal">Loading bookings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">My Bookings</h1>
        <p className="text-gunmetal/60 mt-1">Manage bookings for your services</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card-stat bg-card-blue">
          <p className="text-sm text-gunmetal/60">Total Bookings</p>
          <p className="text-3xl font-bold text-gunmetal">{stats.total}</p>
        </div>
        <div className="card-stat bg-card-yellow">
          <p className="text-sm text-gunmetal/60">Pending</p>
          <p className="text-3xl font-bold text-saffron-dark">{stats.pending}</p>
        </div>
        <div className="card-stat bg-card-purple">
          <p className="text-sm text-gunmetal/60">Partial</p>
          <p className="text-3xl font-bold text-moonstone">{stats.partial}</p>
        </div>
        <div className="card-stat bg-card-green">
          <p className="text-sm text-gunmetal/60">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="card-stat bg-card-pink">
          <p className="text-sm text-gunmetal/60">Revenue Received</p>
          <p className="text-2xl font-bold text-gunmetal">₹{(stats.receivedRevenue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-gunmetal/50 mt-1">of ₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by wedding or service..."
              className="input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filterStatus === 'ALL' ? 'bg-moonstone text-white' : 'bg-gray-100 text-gunmetal hover:bg-gray-200'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filterStatus === 'PENDING' ? 'bg-saffron text-gunmetal' : 'bg-gray-100 text-gunmetal hover:bg-gray-200'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilterStatus('PARTIAL')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filterStatus === 'PARTIAL' ? 'bg-moonstone text-white' : 'bg-gray-100 text-gunmetal hover:bg-gray-200'
              }`}
            >
              Partial ({stats.partial})
            </button>
            <button
              onClick={() => setFilterStatus('COMPLETED')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filterStatus === 'COMPLETED' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gunmetal hover:bg-gray-200'
              }`}
            >
              Completed ({stats.completed})
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gunmetal mb-2">
            {bookings.length === 0 ? 'No bookings yet' : 'No bookings found'}
          </h3>
          <p className="text-gunmetal/60">
            {bookings.length === 0 
              ? 'Bookings will appear here when clients book your services'
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onUpdateStatus={handleUpdateStatus}
              onUpdatePayment={handleUpdatePayment}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Modal Component
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gunmetal">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}