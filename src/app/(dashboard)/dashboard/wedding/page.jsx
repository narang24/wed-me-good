'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const EventCard = ({ event, onDelete }) => {
  const eventDate = new Date(event.date)
  const isPast = eventDate < new Date()
  
  return (
    <div className={`card border-l-4 ${isPast ? 'border-l-green-500 bg-green-50/50' : 'border-l-saffron'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gunmetal">{event.name}</h4>
          <p className="text-sm text-gunmetal/60 mt-1">
            📅 {eventDate.toLocaleDateString('en-IN', { 
              weekday: 'long',
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
          {event.venue && (
            <p className="text-sm text-gunmetal/60 mt-1">📍 {event.venue}</p>
          )}
          {event.notes && (
            <p className="text-sm text-gunmetal/50 mt-2">{event.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isPast && <span className="badge badge-success">Completed</span>}
          <button
            onClick={() => onDelete(event.id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WeddingPage() {
  const [wedding, setWedding] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    venue: '',
    budget: ''
  })

  const [eventData, setEventData] = useState({
    name: '',
    date: '',
    venue: '',
    notes: ''
  })

  const fetchWedding = async () => {
    try {
      const res = await fetch('/api/weddings')
      const data = await res.json()
      if (data.length > 0) {
        setWedding(data[0])
      }
    } catch (error) {
      console.error('Error fetching wedding:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWedding()
  }, [])

  const handleCreateWedding = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/weddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget) || 0
        })
      })

      if (res.ok) {
        const data = await res.json()
        setWedding(data)
        setShowCreateModal(false)
        setFormData({ title: '', date: '', venue: '', budget: '' })
      }
    } catch (error) {
      console.error('Error creating wedding:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateWedding = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/weddings/${wedding.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget) || 0
        })
      })

      if (res.ok) {
        await fetchWedding()
        setShowEditModal(false)
      }
    } catch (error) {
      console.error('Error updating wedding:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/weddings/${wedding.id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })

      if (res.ok) {
        await fetchWedding()
        setShowEventModal(false)
        setEventData({ name: '', date: '', venue: '', notes: '' })
      }
    } catch (error) {
      console.error('Error adding event:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const res = await fetch(`/api/weddings/${wedding.id}/events?eventId=${eventId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        await fetchWedding()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const openEditModal = () => {
    setFormData({
      title: wedding.title,
      date: wedding.date.split('T')[0],
      venue: wedding.venue,
      budget: wedding.budget.toString()
    })
    setShowEditModal(true)
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

  // No wedding created yet
  if (!wedding) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">My Wedding</h1>
        
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">💒</div>
          <h2 className="text-xl font-semibold text-gunmetal mb-2">No Wedding Created Yet</h2>
          <p className="text-gunmetal/60 mb-6">Start by creating your wedding details</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            Create Wedding
          </button>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <Modal title="Create Your Wedding" onClose={() => setShowCreateModal(false)}>
            <form onSubmit={handleCreateWedding} className="space-y-4">
              <div>
                <label className="input-label">Wedding Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Rahul & Priya's Wedding"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="input-label">Wedding Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="input-label">Venue</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Grand Palace Hotel, Delhi"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="input-label">Total Budget (₹)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g., 500000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Creating...' : 'Create Wedding'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    )
  }

  // Wedding exists
  const weddingDate = new Date(wedding.date)
  const today = new Date()
  const daysLeft = Math.ceil((weddingDate - today) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">{wedding.title}</h1>
          <p className="text-gunmetal/60 mt-1">Manage your wedding details and events</p>
        </div>
        <button onClick={openEditModal} className="btn-outline inline-flex items-center gap-2">
          ✏️ Edit Details
        </button>
      </div>

      {/* Wedding Overview Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-stat bg-card-pink">
          <p className="text-sm text-gunmetal/60">Days Left</p>
          <p className="text-3xl font-bold text-gunmetal">{daysLeft > 0 ? daysLeft : 'Today!'}</p>
          <p className="text-sm text-gunmetal/50 mt-1">
            {weddingDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="card-stat bg-card-yellow">
          <p className="text-sm text-gunmetal/60">Venue</p>
          <p className="text-lg font-bold text-gunmetal truncate">{wedding.venue}</p>
          <p className="text-sm text-gunmetal/50 mt-1">📍 Location</p>
        </div>
        <div className="card-stat bg-card-blue">
          <p className="text-sm text-gunmetal/60">Total Budget</p>
          <p className="text-3xl font-bold text-gunmetal">₹{wedding.budget.toLocaleString()}</p>
          <p className="text-sm text-gunmetal/50 mt-1">Allocated</p>
        </div>
        <div className="card-stat bg-card-purple">
          <p className="text-sm text-gunmetal/60">Events Planned</p>
          <p className="text-3xl font-bold text-gunmetal">{wedding.events?.length || 0}</p>
          <p className="text-sm text-gunmetal/50 mt-1">Functions</p>
        </div>
      </div>

      {/* Events Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gunmetal">Wedding Events</h2>
          <button onClick={() => setShowEventModal(true)} className="btn-primary">
            + Add Event
          </button>
        </div>

        {wedding.events?.length === 0 ? (
          <div className="text-center py-12 text-gunmetal/50">
            <p className="text-4xl mb-2">🎉</p>
            <p>No events added yet. Add events like Haldi, Mehendi, Sangeet, etc.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {wedding.events?.map((event) => (
              <EventCard key={event.id} event={event} onDelete={handleDeleteEvent} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/dashboard/guests" className="card hover:shadow-lg transition-all text-center">
          <span className="text-3xl">👥</span>
          <p className="font-semibold text-gunmetal mt-2">Manage Guests</p>
          <p className="text-sm text-gunmetal/50">{wedding._count?.guests || 0} guests</p>
        </Link>
        <Link href="/dashboard/vendors" className="card hover:shadow-lg transition-all text-center">
          <span className="text-3xl">🤝</span>
          <p className="font-semibold text-gunmetal mt-2">Manage Vendors</p>
          <p className="text-sm text-gunmetal/50">{wedding._count?.bookings || 0} booked</p>
        </Link>
        <Link href="/dashboard/tasks" className="card hover:shadow-lg transition-all text-center">
          <span className="text-3xl">✅</span>
          <p className="font-semibold text-gunmetal mt-2">Manage Tasks</p>
          <p className="text-sm text-gunmetal/50">{wedding._count?.tasks || 0} tasks</p>
        </Link>
      </div>

      {/* Edit Wedding Modal */}
      {showEditModal && (
        <Modal title="Edit Wedding Details" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleUpdateWedding} className="space-y-4">
            <div>
              <label className="input-label">Wedding Title</label>
              <input
                type="text"
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Wedding Date</label>
              <input
                type="date"
                className="input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Venue</label>
              <input
                type="text"
                className="input"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Total Budget (₹)</label>
              <input
                type="number"
                className="input"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowEditModal(false)} className="btn-outline flex-1">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <Modal title="Add Wedding Event" onClose={() => setShowEventModal(false)}>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <label className="input-label">Event Name</label>
              <select
                className="input"
                value={eventData.name}
                onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
                required
              >
                <option value="">Select event type</option>
                <option value="Engagement">Engagement</option>
                <option value="Haldi">Haldi</option>
                <option value="Mehendi">Mehendi</option>
                <option value="Sangeet">Sangeet</option>
                <option value="Wedding Ceremony">Wedding Ceremony</option>
                <option value="Reception">Reception</option>
                <option value="Cocktail Party">Cocktail Party</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="input-label">Event Date</label>
              <input
                type="date"
                className="input"
                value={eventData.date}
                onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Venue (Optional)</label>
              <input
                type="text"
                className="input"
                placeholder="Leave empty if same as wedding venue"
                value={eventData.venue}
                onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Notes (Optional)</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Any special notes for this event..."
                value={eventData.notes}
                onChange={(e) => setEventData({ ...eventData, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowEventModal(false)} className="btn-outline flex-1">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Adding...' : 'Add Event'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// Modal Component
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
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