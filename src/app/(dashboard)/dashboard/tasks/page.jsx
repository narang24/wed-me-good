'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    deadline: new Date(task.deadline).toISOString().split('T')[0],
    status: task.status,
    priority: task.priority
  })

  const deadline = new Date(task.deadline)
  const today = new Date()
  const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
  const isOverdue = daysUntil < 0 && task.status !== 'COMPLETED'
  const isUrgent = daysUntil <= 3 && daysUntil >= 0 && task.status !== 'COMPLETED'

  const priorityColors = {
    1: 'bg-green-100 text-green-700',
    2: 'bg-saffron/30 text-saffron-dark',
    3: 'bg-red-100 text-red-700'
  }

  const priorityLabels = {
    1: 'Low',
    2: 'Medium',
    3: 'High'
  }

  const statusColors = {
    PENDING: 'badge-warning',
    IN_PROGRESS: 'badge-info',
    COMPLETED: 'badge-success'
  }

  const handleUpdateTask = async (e) => {
    e.preventDefault()
    await onUpdate(task.id, editData)
    setShowEditModal(false)
  }

  const handleQuickStatusChange = async (newStatus) => {
    await onUpdate(task.id, { status: newStatus })
  }

  return (
    <>
      <div className={`card border-l-4 ${
        task.status === 'COMPLETED' ? 'border-l-green-500 bg-green-50/30' :
        isOverdue ? 'border-l-red-500' :
        isUrgent ? 'border-l-orange-500' :
        'border-l-moonstone'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-semibold text-gunmetal ${task.status === 'COMPLETED' ? 'line-through opacity-60' : ''}`}>
                {task.title}
              </h3>
              <span className={`badge ${priorityColors[task.priority]} text-xs`}>
                {priorityLabels[task.priority]}
              </span>
            </div>
            {task.description && (
              <p className="text-sm text-gunmetal/60 mb-2">{task.description}</p>
            )}
          </div>
          <span className={`badge ${statusColors[task.status]}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gunmetal/70 mb-4">
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          {isOverdue && (
            <span className="text-red-600 font-medium">⚠️ Overdue by {Math.abs(daysUntil)} days</span>
          )}
          {isUrgent && (
            <span className="text-orange-600 font-medium">⏰ Due in {daysUntil} days</span>
          )}
          {!isOverdue && !isUrgent && task.status !== 'COMPLETED' && daysUntil >= 0 && (
            <span>⏳ {daysUntil} days left</span>
          )}
        </div>

        <div className="flex gap-2">
          {task.status !== 'COMPLETED' && (
            <>
              {task.status === 'PENDING' && (
                <button
                  onClick={() => handleQuickStatusChange('IN_PROGRESS')}
                  className="btn-secondary flex-1 text-sm"
                >
                  Start Task
                </button>
              )}
              {task.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleQuickStatusChange('COMPLETED')}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-600 transition-colors flex-1 text-sm"
                >
                  ✓ Complete
                </button>
              )}
            </>
          )}
          <button onClick={() => setShowEditModal(true)} className="btn-outline px-4 text-sm">
            ✏️
          </button>
          <button onClick={() => onDelete(task.id)} className="btn-outline px-4 text-sm text-red-500 border-red-500 hover:bg-red-50">
            🗑️
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gunmetal">Edit Task</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="input-label">Task Title *</label>
                <input
                  type="text"
                  className="input"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="input-label">Description</label>
                <textarea
                  className="input min-h-[80px]"
                  placeholder="Add details about this task..."
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Deadline *</label>
                <input
                  type="date"
                  className="input"
                  value={editData.deadline}
                  onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="input-label">Status</label>
                <select
                  className="input"
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div>
                <label className="input-label">Priority</label>
                <select
                  className="input"
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: parseInt(e.target.value) })}
                >
                  <option value="1">Low Priority</option>
                  <option value="2">Medium Priority</option>
                  <option value="3">High Priority</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 2
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        await fetchTasks()
        setShowAddModal(false)
        setFormData({ title: '', description: '', deadline: '', priority: 2 })
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to add task')
      }
    } catch (error) {
      console.error('Error adding task:', error)
      alert('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateTask = async (taskId, updateData) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (res.ok) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const filteredTasks = tasks.filter(t => 
    filterStatus === 'ALL' || t.status === filterStatus
  )

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    overdue: tasks.filter(t => {
      const deadline = new Date(t.deadline)
      return deadline < new Date() && t.status !== 'COMPLETED'
    }).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-moonstone" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gunmetal">Loading tasks...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">Task Management</h1>
          <p className="text-gunmetal/60 mt-1">Keep track of your wedding planning checklist</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          + Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card-stat bg-card-blue">
          <p className="text-sm text-gunmetal/60">Total Tasks</p>
          <p className="text-3xl font-bold text-gunmetal">{stats.total}</p>
        </div>
        <div className="card-stat bg-card-yellow">
          <p className="text-sm text-gunmetal/60">Pending</p>
          <p className="text-3xl font-bold text-saffron-dark">{stats.pending}</p>
        </div>
        <div className="card-stat bg-card-purple">
          <p className="text-sm text-gunmetal/60">In Progress</p>
          <p className="text-3xl font-bold text-moonstone">{stats.inProgress}</p>
        </div>
        <div className="card-stat bg-card-green">
          <p className="text-sm text-gunmetal/60">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="card-stat bg-card-pink">
          <p className="text-sm text-gunmetal/60">Overdue</p>
          <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-3">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filterStatus === 'ALL' ? 'bg-moonstone text-white' : 'bg-gray-100 text-gunmetal hover:bg-gray-200'
            }`}
          >
            All ({tasks.length})
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
            onClick={() => setFilterStatus('IN_PROGRESS')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filterStatus === 'IN_PROGRESS' ? 'bg-moonstone text-white' : 'bg-gray-100 text-gunmetal hover:bg-gray-200'
            }`}
          >
            In Progress ({stats.inProgress})
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

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gunmetal mb-2">
            {tasks.length === 0 ? 'No tasks yet' : 'No tasks in this category'}
          </h3>
          <p className="text-gunmetal/60 mb-6">
            {tasks.length === 0 
              ? 'Start adding tasks to keep track of your wedding planning'
              : 'Try selecting a different filter'}
          </p>
          {tasks.length === 0 && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              Add Your First Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <Modal title="Add New Task" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="input-label">Task Title *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Book wedding photographer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Description</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Add details about this task..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Deadline *</label>
              <input
                type="date"
                className="input"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Priority</label>
              <select
                className="input"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              >
                <option value="1">Low Priority</option>
                <option value="2">Medium Priority</option>
                <option value="3">High Priority</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline flex-1">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Adding...' : 'Add Task'}
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