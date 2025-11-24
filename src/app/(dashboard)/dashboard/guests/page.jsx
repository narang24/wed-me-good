'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const GuestCard = ({ guest, onUpdate, onDelete, onSendInvite }) => {
  const [showRSVPModal, setShowRSVPModal] = useState(false)
  const [rsvpData, setRsvpData] = useState({
    status: guest.rsvp?.status || 'PENDING',
    noOfPersons: guest.rsvp?.noOfPersons || 1,
    message: guest.rsvp?.message || ''
  })

  const statusColors = {
    PENDING: 'badge-warning',
    ACCEPTED: 'badge-success',
    REJECTED: 'badge-danger'
  }

  const handleUpdateRSVP = async (e) => {
    e.preventDefault()
    await onUpdate(guest.id, rsvpData)
    setShowRSVPModal(false)
  }

  return (
    <>
      <div className="card hover:shadow-lg transition-all">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gunmetal text-lg">{guest.name}</h3>
            <p className="text-sm text-gunmetal/60">{guest.email}</p>
          </div>
          <span className={`badge ${statusColors[guest.rsvp?.status || 'PENDING']}`}>
            {guest.rsvp?.status || 'PENDING'}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {guest.phone && (
            <div className="flex items-center gap-2 text-sm text-gunmetal/70">
              <span>📞</span>
              <span>{guest.phone}</span>
            </div>
          )}
          {guest.address && (
            <div className="flex items-center gap-2 text-sm text-gunmetal/70">
              <span>📍</span>
              <span className="truncate">{guest.address}</span>
            </div>
          )}
          {guest.rsvp && (
            <div className="flex items-center gap-2 text-sm text-gunmetal/70">
              <span>👥</span>
              <span>{guest.rsvp.noOfPersons} person{guest.rsvp.noOfPersons > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {guest.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gunmetal/70">📝 {guest.notes}</p>
          </div>
        )}

        {guest.rsvp?.message && (
          <div className="mb-4 p-3 bg-light-blue/20 rounded-lg border-l-4 border-l-moonstone">
            <p className="text-sm text-gunmetal/70 italic">"{guest.rsvp.message}"</p>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setShowRSVPModal(true)} className="btn-secondary flex-1 text-sm">
            Update RSVP
          </button>
          <button onClick={() => onSendInvite(guest)} className="btn-outline px-4 text-sm">
            📧
          </button>
          <button onClick={() => onDelete(guest.id)} className="btn-outline px-4 text-sm text-red-500 border-red-500 hover:bg-red-50">
            🗑️
          </button>
        </div>
      </div>

      {/* RSVP Modal */}
      {showRSVPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRSVPModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gunmetal">Update RSVP - {guest.name}</h3>
              <button onClick={() => setShowRSVPModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateRSVP} className="space-y-4">
              <div>
                <label className="input-label">RSVP Status</label>
                <select
                  className="input"
                  value={rsvpData.status}
                  onChange={(e) => setRsvpData({ ...rsvpData, status: e.target.value })}
                >
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div>
                <label className="input-label">Number of Persons</label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  value={rsvpData.noOfPersons}
                  onChange={(e) => setRsvpData({ ...rsvpData, noOfPersons: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="input-label">Message (Optional)</label>
                <textarea
                  className="input min-h-[80px]"
                  placeholder="Guest's message..."
                  value={rsvpData.message}
                  onChange={(e) => setRsvpData({ ...rsvpData, message: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowRSVPModal(false)} className="btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Update RSVP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default function GuestsPage() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  })

  const [bulkData, setBulkData] = useState('')

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/guests')
      const data = await res.json()
      setGuests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching guests:', error)
      setGuests([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddGuest = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        await fetchGuests()
        setShowAddModal(false)
        setFormData({ name: '', email: '', phone: '', address: '', notes: '' })
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to add guest')
      }
    } catch (error) {
      console.error('Error adding guest:', error)
      alert('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkImport = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Parse CSV format: name,email,phone,address
      const lines = bulkData.trim().split('\n')
      const guestsToAdd = lines.map(line => {
        const [name, email, phone, address] = line.split(',').map(s => s.trim())
        return { name, email, phone: phone || '', address: address || '' }
      }).filter(g => g.name && g.email)

      const res = await fetch('/api/guests/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: guestsToAdd })
      })

      if (res.ok) {
        await fetchGuests()
        setShowBulkModal(false)
        setBulkData('')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to import guests')
      }
    } catch (error) {
      console.error('Error bulk importing:', error)
      alert('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateRSVP = async (guestId, rsvpData) => {
    try {
      const res = await fetch(`/api/guests/${guestId}/rsvp`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvpData)
      })

      if (res.ok) {
        await fetchGuests()
      }
    } catch (error) {
      console.error('Error updating RSVP:', error)
    }
  }

  const handleDeleteGuest = async (guestId) => {
    if (!confirm('Are you sure you want to delete this guest?')) return

    try {
      const res = await fetch(`/api/guests/${guestId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchGuests()
      }
    } catch (error) {
      console.error('Error deleting guest:', error)
    }
  }

  const handleSendInvite = (guest) => {
    alert(`Sending invitation to ${guest.name} at ${guest.email}`)
    // TODO: Implement actual email sending
  }

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         g.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'ALL' || 
                         (g.rsvp?.status || 'PENDING') === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: guests.length,
    accepted: guests.filter(g => g.rsvp?.status === 'ACCEPTED').length,
    pending: guests.filter(g => !g.rsvp || g.rsvp.status === 'PENDING').length,
    rejected: guests.filter(g => g.rsvp?.status === 'REJECTED').length,
    totalPersons: guests.reduce((sum, g) => sum + (g.rsvp?.noOfPersons || 1), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-moonstone" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gunmetal">Loading guests...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">Guest Management</h1>
          <p className="text-gunmetal/60 mt-1">Manage your wedding guest list and RSVPs</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowBulkModal(true)} className="btn-outline">
            📋 Bulk Import
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            + Add Guest
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card-stat bg-card-blue">
          <p className="text-sm text-gunmetal/60">Total Guests</p>
          <p className="text-3xl font-bold text-gunmetal">{stats.total}</p>
        </div>
        <div className="card-stat bg-card-green">
          <p className="text-sm text-gunmetal/60">Accepted</p>
          <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className="card-stat bg-card-yellow">
          <p className="text-sm text-gunmetal/60">Pending</p>
          <p className="text-3xl font-bold text-saffron-dark">{stats.pending}</p>
        </div>
        <div className="card-stat bg-card-pink">
          <p className="text-sm text-gunmetal/60">Rejected</p>
          <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
        </div>
        <div className="card-stat bg-card-purple">
          <p className="text-sm text-gunmetal/60">Total Persons</p>
          <p className="text-3xl font-bold text-gunmetal">{stats.totalPersons}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search guests by name or email..."
              className="input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:w-48">
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guests Grid */}
      {filteredGuests.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gunmetal mb-2">
            {guests.length === 0 ? 'No guests added yet' : 'No guests found'}
          </h3>
          <p className="text-gunmetal/60 mb-6">
            {guests.length === 0 
              ? 'Start adding guests to your wedding'
              : 'Try adjusting your search or filters'}
          </p>
          {guests.length === 0 && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              Add Your First Guest
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuests.map(guest => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onUpdate={handleUpdateRSVP}
              onDelete={handleDeleteGuest}
              onSendInvite={handleSendInvite}
            />
          ))}
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddModal && (
        <Modal title="Add New Guest" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddGuest} className="space-y-4">
            <div>
              <label className="input-label">Full Name *</label>
              <input
                type="text"
                className="input"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Email *</label>
              <input
                type="email"
                className="input"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Phone</label>
              <input
                type="tel"
                className="input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Address</label>
              <input
                type="text"
                className="input"
                placeholder="City, State"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Notes</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Any special notes about this guest..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline flex-1">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Adding...' : 'Add Guest'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <Modal title="Bulk Import Guests" onClose={() => setShowBulkModal(false)}>
          <form onSubmit={handleBulkImport} className="space-y-4">
            <div>
              <label className="input-label">Paste CSV Data</label>
              <textarea
                className="input min-h-[200px] font-mono text-sm"
                placeholder="name,email,phone,address&#10;John Doe,john@example.com,1234567890,New York&#10;Jane Smith,jane@example.com,0987654321,California"
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                required
              />
              <p className="text-xs text-gunmetal/50 mt-2">
                Format: name,email,phone,address (one guest per line)
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowBulkModal(false)} className="btn-outline flex-1">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Importing...' : 'Import Guests'}
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