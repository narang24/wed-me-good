'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const ServiceCard = ({ service, onEdit, onDelete }) => {
  return (
    <div className="card hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gunmetal text-lg">{service.name}</h3>
            <span className="flex items-center gap-1 bg-saffron/20 px-2 py-1 rounded-lg">
              <span className="text-saffron-dark font-semibold text-sm">{service.rating.toFixed(1)}</span>
              <span className="text-xs">⭐</span>
            </span>
          </div>
          <p className="text-sm text-saffron-dark font-medium mb-2">{service.category.name}</p>
        </div>
      </div>

      {service.description && (
        <p className="text-sm text-gunmetal/60 mb-4 line-clamp-3">{service.description}</p>
      )}

      {/* Images Preview */}
      {service.images && service.images.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {service.images.slice(0, 3).map((img, i) => (
            <div key={i} className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
              <span className="text-2xl">🖼️</span>
            </div>
          ))}
          {service.images.length > 3 && (
            <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
              <span className="text-sm text-gunmetal/60">+{service.images.length - 3}</span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gunmetal/60">Base Price:</span>
          <span className="font-semibold text-gunmetal">₹{service.cost.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gunmetal/60">Total Bookings:</span>
          <span className="font-semibold text-moonstone">{service._count?.bookings || 0}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {service.contact && (
          <div className="flex items-center gap-2 text-gunmetal/70">
            <span>📞</span>
            <span>{service.contact}</span>
          </div>
        )}
        {service.email && (
          <div className="flex items-center gap-2 text-gunmetal/70">
            <span>📧</span>
            <span className="truncate">{service.email}</span>
          </div>
        )}
        {service.address && (
          <div className="flex items-center gap-2 text-gunmetal/70">
            <span>📍</span>
            <span className="truncate">{service.address}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        <button onClick={() => onEdit(service)} className="btn-secondary flex-1 text-sm">
          ✏️ Edit
        </button>
        <button onClick={() => onDelete(service.id)} className="btn-outline px-4 text-sm text-red-500 border-red-500 hover:bg-red-50">
          🗑️
        </button>
      </div>
    </div>
  )
}

export default function VendorServicesPage() {
  const { data: session } = useSession()
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    cost: '',
    contact: '',
    email: '',
    address: '',
    images: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch categories
      const categoriesRes = await fetch('/api/categories')
      const categoriesData = await categoriesRes.json()
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])

      // Fetch vendor's services
      const servicesRes = await fetch('/api/vendors/my-services')
      const servicesData = await servicesRes.json()
      
      if (Array.isArray(servicesData)) {
        setServices(servicesData)
      } else if (servicesData.services && Array.isArray(servicesData.services)) {
        setServices(servicesData.services)
      } else {
        setServices([])
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      setServices([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        categoryId: service.categoryId,
        description: service.description || '',
        cost: service.cost.toString(),
        contact: service.contact || '',
        email: service.email || '',
        address: service.address || '',
        images: service.images?.join(', ') || ''
      })
    } else {
      setEditingService(null)
      setFormData({
        name: '',
        categoryId: '',
        description: '',
        cost: '',
        contact: session?.user?.email || '',
        email: session?.user?.email || '',
        address: '',
        images: ''
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingService(null)
    setFormData({
      name: '',
      categoryId: '',
      description: '',
      cost: '',
      contact: '',
      email: '',
      address: '',
      images: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Parse images from comma-separated string
      const imagesArray = formData.images
        ? formData.images.split(',').map(s => s.trim()).filter(Boolean)
        : []

      const payload = {
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description || null,
        cost: parseFloat(formData.cost),
        contact: formData.contact,
        email: formData.email || null,
        address: formData.address || null,
        images: imagesArray
      }

      const url = editingService 
        ? `/api/vendors/my-services/${editingService.id}`
        : '/api/vendors/my-services'
      
      const method = editingService ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        await fetchData()
        handleCloseModal()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save service')
      }
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service? All associated bookings will be affected.')) {
      return
    }

    try {
      const res = await fetch(`/api/vendors/my-services/${serviceId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        await fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to delete service')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Something went wrong')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-moonstone" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gunmetal">Loading services...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">My Services</h1>
          <p className="text-gunmetal/60 mt-1">Manage your wedding services and offerings</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          + Add New Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-stat bg-card-blue">
          <p className="text-sm text-gunmetal/60">Total Services</p>
          <p className="text-3xl font-bold text-gunmetal">{services.length}</p>
        </div>
        <div className="card-stat bg-card-green">
          <p className="text-sm text-gunmetal/60">Total Bookings</p>
          <p className="text-3xl font-bold text-green-600">
            {services.reduce((sum, s) => sum + (s._count?.bookings || 0), 0)}
          </p>
        </div>
        <div className="card-stat bg-card-yellow">
          <p className="text-sm text-gunmetal/60">Avg Rating</p>
          <p className="text-3xl font-bold text-saffron-dark">
            {services.length > 0 
              ? (services.reduce((sum, s) => sum + s.rating, 0) / services.length).toFixed(1)
              : '0.0'
            }⭐
          </p>
        </div>
        <div className="card-stat bg-card-purple">
          <p className="text-sm text-gunmetal/60">Categories</p>
          <p className="text-3xl font-bold text-gunmetal">
            {new Set(services.map(s => s.categoryId)).size}
          </p>
        </div>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🛠️</div>
          <h3 className="text-xl font-semibold text-gunmetal mb-2">No services added yet</h3>
          <p className="text-gunmetal/60 mb-6">Start by adding your first service offering</p>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            Add Your First Service
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal 
          title={editingService ? 'Edit Service' : 'Add New Service'} 
          onClose={handleCloseModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Service Name *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Premium Wedding Photography"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="input-label">Category *</label>
              <select
                className="input"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Description</label>
              <textarea
                className="input min-h-[100px]"
                placeholder="Describe your service, what's included, your experience, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="input-label">Base Price (₹) *</label>
              <input
                type="number"
                className="input"
                placeholder="e.g., 50000"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                required
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gunmetal/50 mt-1">Starting price for your service</p>
            </div>

            <div>
              <label className="input-label">Contact Number *</label>
              <input
                type="tel"
                className="input"
                placeholder="+91 98765 43210"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="input-label">Address/Location</label>
              <input
                type="text"
                className="input"
                placeholder="City, State"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <label className="input-label">Portfolio Images (URLs)</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Enter image URLs separated by commas&#10;e.g., https://example.com/img1.jpg, https://example.com/img2.jpg"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              />
              <p className="text-xs text-gunmetal/50 mt-1">
                Enter comma-separated image URLs to showcase your work
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={handleCloseModal} className="btn-outline flex-1">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? (editingService ? 'Updating...' : 'Adding...') : (editingService ? 'Update Service' : 'Add Service')}
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
      <div className="relative bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
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