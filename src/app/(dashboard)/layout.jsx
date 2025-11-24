'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const menuItems = {
  COUPLE: [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'My Wedding', href: '/dashboard/wedding', icon: '💒' },
    { name: 'Vendors', href: '/dashboard/vendors', icon: '🤝' },
    { name: 'Guests', href: '/dashboard/guests', icon: '👥' },
    { name: 'Budget', href: '/dashboard/budget', icon: '💰' },
    { name: 'Tasks', href: '/dashboard/tasks', icon: '✅' },
    { name: 'Reports', href: '/dashboard/reports', icon: '📊' },
  ],
  VENDOR: [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'My Services', href: '/dashboard/services', icon: '🛠️' },
    { name: 'Bookings', href: '/dashboard/bookings', icon: '📅' },
    { name: 'Reviews', href: '/dashboard/reviews', icon: '⭐' },
  ],
  GUEST: [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Invitations', href: '/dashboard/invitations', icon: '💌' },
    { name: 'My RSVPs', href: '/dashboard/rsvps', icon: '✉️' },
  ],
  ADMIN: [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Users', href: '/dashboard/users', icon: '👤' },
    { name: 'All Weddings', href: '/dashboard/weddings', icon: '💒' },
    { name: 'All Vendors', href: '/dashboard/vendors', icon: '🤝' },
    { name: 'Categories', href: '/dashboard/categories', icon: '📁' },
    { name: 'Reports', href: '/dashboard/reports', icon: '📊' },
  ],
}

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-moonstone" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gunmetal font-medium">Loading...</span>
        </div>
      </div>
    )
  }

  if (!session) return null

  const userRole = session.user?.role || 'COUPLE'
  const menu = menuItems[userRole] || menuItems.COUPLE

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-white border-r border-gray-100 
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <Link href="/dashboard" className="text-2xl font-bold text-gunmetal">
              <span className="text-moonstone">Wed</span>Plan
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 mx-4 mt-4 bg-light-blue/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-moonstone flex items-center justify-center text-white font-bold text-lg">
                {session.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gunmetal truncate">{session.user?.name}</p>
                <p className="text-sm text-gunmetal/60 truncate">{session.user?.email}</p>
              </div>
            </div>
            <div className="mt-3">
              <span className="badge badge-info">{userRole}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menu.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100"
          >
            <svg className="w-6 h-6 text-gunmetal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-moonstone"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100">
              <svg className="w-6 h-6 text-gunmetal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-saffron rounded-full"></span>
            </button>

            {/* Profile */}
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-moonstone flex items-center justify-center text-white font-bold">
                {session.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="font-medium text-gunmetal text-sm">{session.user?.name}</p>
                <p className="text-xs text-gunmetal/60">{userRole}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}