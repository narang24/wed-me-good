'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

const StatCard = ({ title, value, subtitle, icon, bgColor }) => (
  <div className={`${bgColor} card-stat`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gunmetal/60 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gunmetal">{value}</p>
        {subtitle && <p className="text-sm text-gunmetal/50 mt-1">{subtitle}</p>}
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
)

const QuickAction = ({ title, description, href, icon, color }) => (
  <Link href={href} className="card hover:shadow-lg transition-all group">
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <span className="text-2xl">{icon}</span>
    </div>
    <h3 className="font-semibold text-gunmetal mb-1">{title}</h3>
    <p className="text-sm text-gunmetal/60">{description}</p>
  </Link>
)

const TaskItem = ({ title, deadline, status }) => {
  const statusColors = {
    PENDING: 'badge-warning',
    IN_PROGRESS: 'badge-info',
    COMPLETED: 'badge-success'
  }
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${status === 'COMPLETED' ? 'bg-green-500' : 'bg-saffron'}`} />
        <div>
          <p className="font-medium text-gunmetal">{title}</p>
          <p className="text-sm text-gunmetal/50">{deadline}</p>
        </div>
      </div>
      <span className={`badge ${statusColors[status]}`}>
        {status.replace('_', ' ')}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const userName = session?.user?.name?.split(' ')[0] || 'User'

  // Mock data - will be replaced with real API calls
  const stats = {
    daysLeft: 45,
    guests: { total: 150, confirmed: 89 },
    budget: { total: 500000, spent: 325000 },
    tasks: { total: 24, completed: 18 },
    vendors: { booked: 8, total: 12 }
  }

  const recentTasks = [
    { id: 1, title: 'Finalize catering menu', deadline: 'Due in 3 days', status: 'PENDING' },
    { id: 2, title: 'Confirm photographer timing', deadline: 'Due in 5 days', status: 'IN_PROGRESS' },
    { id: 3, title: 'Send invitation cards', deadline: 'Completed', status: 'COMPLETED' },
    { id: 4, title: 'Book mehendi artist', deadline: 'Due in 7 days', status: 'PENDING' },
  ]

  const budgetPercentage = Math.round((stats.budget.spent / stats.budget.total) * 100)
  const taskPercentage = Math.round((stats.tasks.completed / stats.tasks.total) * 100)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-gunmetal/60 mt-1">
            Here's what's happening with your wedding plans.
          </p>
        </div>
        <Link href="/dashboard/wedding" className="btn-primary inline-flex items-center gap-2">
          <span>View Wedding Details</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Days Until Wedding"
          value={stats.daysLeft}
          subtitle="Keep planning!"
          icon="💒"
          bgColor="bg-card-pink"
        />
        <StatCard
          title="Guests Confirmed"
          value={`${stats.guests.confirmed}/${stats.guests.total}`}
          subtitle={`${Math.round((stats.guests.confirmed / stats.guests.total) * 100)}% responded`}
          icon="👥"
          bgColor="bg-card-yellow"
        />
        <StatCard
          title="Budget Spent"
          value={`₹${(stats.budget.spent / 1000).toFixed(0)}K`}
          subtitle={`of ₹${(stats.budget.total / 1000).toFixed(0)}K total`}
          icon="💰"
          bgColor="bg-card-blue"
        />
        <StatCard
          title="Tasks Completed"
          value={`${stats.tasks.completed}/${stats.tasks.total}`}
          subtitle={`${taskPercentage}% done`}
          icon="✅"
          bgColor="bg-card-purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Progress & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Budget Progress */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gunmetal">Budget Overview</h3>
                <span className="text-sm text-moonstone font-medium">{budgetPercentage}%</span>
              </div>
              <div className="progress-bar mb-3">
                <div className="progress-fill" style={{ width: `${budgetPercentage}%` }} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gunmetal/60">Spent: ₹{stats.budget.spent.toLocaleString()}</span>
                <span className="text-gunmetal/60">Left: ₹{(stats.budget.total - stats.budget.spent).toLocaleString()}</span>
              </div>
            </div>

            {/* Task Progress */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gunmetal">Task Progress</h3>
                <span className="text-sm text-moonstone font-medium">{taskPercentage}%</span>
              </div>
              <div className="progress-bar mb-3">
                <div className="progress-fill" style={{ width: `${taskPercentage}%` }} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gunmetal/60">Completed: {stats.tasks.completed}</span>
                <span className="text-gunmetal/60">Remaining: {stats.tasks.total - stats.tasks.completed}</span>
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gunmetal">Recent Tasks</h3>
              <Link href="/dashboard/tasks" className="text-sm text-moonstone hover:text-moonstone-dark">
                View All →
              </Link>
            </div>
            <div>
              {recentTasks.map(task => (
                <TaskItem key={task.id} {...task} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions & Vendors */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-gunmetal mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/dashboard/guests" className="flex items-center gap-3 p-3 rounded-xl bg-card-pink hover:bg-card-pink/70 transition-colors">
                <span className="text-xl">👥</span>
                <span className="font-medium text-gunmetal">Add Guests</span>
              </Link>
              <Link href="/dashboard/vendors" className="flex items-center gap-3 p-3 rounded-xl bg-card-yellow hover:bg-card-yellow/70 transition-colors">
                <span className="text-xl">🤝</span>
                <span className="font-medium text-gunmetal">Browse Vendors</span>
              </Link>
              <Link href="/dashboard/tasks" className="flex items-center gap-3 p-3 rounded-xl bg-card-blue hover:bg-card-blue/70 transition-colors">
                <span className="text-xl">✅</span>
                <span className="font-medium text-gunmetal">Add Task</span>
              </Link>
              <Link href="/dashboard/budget" className="flex items-center gap-3 p-3 rounded-xl bg-card-purple hover:bg-card-purple/70 transition-colors">
                <span className="text-xl">💰</span>
                <span className="font-medium text-gunmetal">Add Expense</span>
              </Link>
            </div>
          </div>

          {/* Booked Vendors */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gunmetal">Booked Vendors</h3>
              <span className="badge badge-success">{stats.vendors.booked} booked</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Royal Caterers', category: 'Caterer', status: 'Confirmed' },
                { name: 'Snap Studios', category: 'Photographer', status: 'Confirmed' },
                { name: 'Decor Dreams', category: 'Decorator', status: 'Pending' },
              ].map((vendor, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gunmetal">{vendor.name}</p>
                    <p className="text-sm text-gunmetal/50">{vendor.category}</p>
                  </div>
                  <span className={`badge ${vendor.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}`}>
                    {vendor.status}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/dashboard/vendors" className="block mt-4 text-center text-sm text-moonstone hover:text-moonstone-dark">
              View All Vendors →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}