'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const ExpenseCard = ({ expense, onDelete }) => {
  const expenseDate = new Date(expense.date)
  
  return (
    <div className="card border-l-4 border-l-moonstone">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">
              {expense.category.name === 'Caterer' && '🍽️'}
              {expense.category.name === 'Photographer' && '📸'}
              {expense.category.name === 'Decorator' && '🎨'}
              {expense.category.name === 'Venue' && '🏛️'}
              {expense.category.name === 'DJ' && '🎵'}
              {expense.category.name === 'Makeup' && '💄'}
              {!['Caterer', 'Photographer', 'Decorator', 'Venue', 'DJ', 'Makeup'].includes(expense.category.name) && '💰'}
            </span>
            <div>
              <h4 className="font-semibold text-gunmetal">{expense.category.name}</h4>
              <p className="text-sm text-gunmetal/60">
                {expenseDate.toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          {expense.remarks && (
            <p className="text-sm text-gunmetal/70 mt-2 pl-11">{expense.remarks}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-gunmetal">₹{expense.amount.toLocaleString()}</p>
          </div>
          <button
            onClick={() => onDelete(expense.id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

const CategoryBudgetCard = ({ category, spent, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="card hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gunmetal">{category.name}</h4>
        <span className="text-2xl">
          {category.name === 'Caterer' && '🍽️'}
          {category.name === 'Photographer' && '📸'}
          {category.name === 'Decorator' && '🎨'}
          {category.name === 'Venue' && '🏛️'}
          {category.name === 'DJ' && '🎵'}
          {category.name === 'Makeup' && '💄'}
          {!['Caterer', 'Photographer', 'Decorator', 'Venue', 'DJ', 'Makeup'].includes(category.name) && '💰'}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gunmetal/60">Spent:</span>
          <span className="font-bold text-moonstone">₹{spent.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gunmetal/60">Expenses:</span>
          <span className="text-gunmetal/70">{category._count?.expenses || 0}</span>
        </div>
      </div>
    </div>
  )
}

export default function BudgetPage() {
  const [wedding, setWedding] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    remarks: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchData()
  }, [selectedCategory])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch wedding
      const weddingRes = await fetch('/api/weddings')
      const weddingData = await weddingRes.json()
      if (weddingData.length > 0) {
        setWedding(weddingData[0])
      }

      // Fetch categories
      const categoriesRes = await fetch('/api/categories')
      const categoriesData = await categoriesRes.json()
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])

      // Fetch expenses
      const expensesUrl = selectedCategory 
        ? `/api/expenses?categoryId=${selectedCategory}` 
        : '/api/expenses'
      const expensesRes = await fetch(expensesUrl)
      const expensesData = await expensesRes.json()
      setExpenses(Array.isArray(expensesData) ? expensesData : [])

    } catch (error) {
      console.error('Error fetching data:', error)
      setExpenses([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: formData.categoryId,
          amount: parseFloat(formData.amount),
          remarks: formData.remarks || null,
          date: formData.date
        })
      })

      if (res.ok) {
        await fetchData()
        setShowAddModal(false)
        setFormData({
          categoryId: '',
          amount: '',
          remarks: '',
          date: new Date().toISOString().split('T')[0]
        })
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to add expense')
      }
    } catch (error) {
      console.error('Error adding expense:', error)
      alert('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      const res = await fetch(`/api/expenses/${expenseId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  // Calculate statistics
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalBudget = wedding?.budget || 0
  const remaining = totalBudget - totalSpent
  const budgetPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  // Category-wise spending
  const categorySpending = categories.map(cat => {
    const spent = expenses
      .filter(exp => exp.categoryId === cat.id)
      .reduce((sum, exp) => sum + exp.amount, 0)
    return { ...cat, spent }
  }).filter(cat => cat.spent > 0)

  // Filter expenses by selected category
  const filteredExpenses = selectedCategory
    ? expenses.filter(exp => exp.categoryId === selectedCategory)
    : expenses

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-moonstone" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gunmetal">Loading budget...</span>
        </div>
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">Budget Management</h1>
        
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">💒</div>
          <h2 className="text-xl font-semibold text-gunmetal mb-2">No Wedding Created Yet</h2>
          <p className="text-gunmetal/60 mb-6">Please create a wedding first to manage your budget</p>
          <Link href="/dashboard/wedding" className="btn-primary">
            Create Wedding
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">Budget Management</h1>
          <p className="text-gunmetal/60 mt-1">Track your wedding expenses and stay within budget</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          + Add Expense
        </button>
      </div>

      {/* Budget Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-stat bg-card-blue">
          <p className="text-sm text-gunmetal/60">Total Budget</p>
          <p className="text-3xl font-bold text-gunmetal">₹{totalBudget.toLocaleString()}</p>
          <p className="text-sm text-gunmetal/50 mt-1">Allocated</p>
        </div>
        <div className="card-stat bg-card-yellow">
          <p className="text-sm text-gunmetal/60">Total Spent</p>
          <p className="text-3xl font-bold text-saffron-dark">₹{totalSpent.toLocaleString()}</p>
          <p className="text-sm text-gunmetal/50 mt-1">{budgetPercentage}% of budget</p>
        </div>
        <div className={`card-stat ${remaining >= 0 ? 'bg-card-green' : 'bg-card-pink'}`}>
          <p className="text-sm text-gunmetal/60">Remaining</p>
          <p className={`text-3xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{Math.abs(remaining).toLocaleString()}
          </p>
          <p className="text-sm text-gunmetal/50 mt-1">
            {remaining >= 0 ? 'Under budget' : 'Over budget'}
          </p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gunmetal">Budget Progress</h3>
          <span className="text-sm text-moonstone font-medium">{budgetPercentage}%</span>
        </div>
        <div className="progress-bar mb-3">
          <div 
            className={`h-full rounded-full ${
              budgetPercentage < 75 ? 'bg-green-500' :
              budgetPercentage < 90 ? 'bg-saffron' :
              budgetPercentage < 100 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gunmetal/60">₹{totalSpent.toLocaleString()} spent</span>
          <span className="text-gunmetal/60">₹{totalBudget.toLocaleString()} budget</span>
        </div>
      </div>

      {/* Category Spending */}
      {categorySpending.length > 0 && (
        <div>
          <h3 className="font-semibold text-gunmetal mb-4">Spending by Category</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorySpending.map(cat => (
              <CategoryBudgetCard
                key={cat.id}
                category={cat}
                spent={cat.spent}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1">
            <select
              className="input"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div>
        <h3 className="font-semibold text-gunmetal mb-4">
          {selectedCategory ? 'Filtered Expenses' : 'All Expenses'} ({filteredExpenses.length})
        </h3>
        
        {filteredExpenses.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">💸</div>
            <h3 className="text-xl font-semibold text-gunmetal mb-2">No expenses recorded yet</h3>
            <p className="text-gunmetal/60 mb-6">Start tracking your wedding expenses</p>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map(expense => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onDelete={handleDeleteExpense}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <Modal title="Add New Expense" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddExpense} className="space-y-4">
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
              <label className="input-label">Amount (₹) *</label>
              <input
                type="number"
                className="input"
                placeholder="e.g., 50000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="input-label">Date *</label>
              <input
                type="date"
                className="input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Remarks (Optional)</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Add notes about this expense..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline flex-1">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Adding...' : 'Add Expense'}
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