import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-blue/30 via-white to-saffron/20">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gunmetal">
          <span className="text-moonstone">Wed</span>Plan
        </h1>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-gunmetal hover:text-moonstone transition-colors font-medium"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="btn-primary"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-32">
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-saffron/20 rounded-full">
            <span className="text-saffron-dark font-medium text-sm">
              ✨ Your Dream Wedding Awaits
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gunmetal mb-6 leading-tight">
            Plan Your Perfect
            <span className="block text-moonstone">Wedding Day</span>
          </h2>
          <p className="text-lg text-gunmetal/70 mb-8 max-w-2xl mx-auto">
            Manage vendors, guests, budget, and tasks all in one place. 
            Make your special day stress-free and memorable.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg px-8 py-3">
              Start Planning Free
            </Link>
            <Link href="#features" className="btn-outline text-lg px-8 py-3">
              Learn More
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '10K+', label: 'Weddings Planned', bg: 'bg-card-pink' },
            { value: '500+', label: 'Vendors', bg: 'bg-card-yellow' },
            { value: '50K+', label: 'Guests Managed', bg: 'bg-card-blue' },
            { value: '4.9★', label: 'User Rating', bg: 'bg-card-purple' }
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} rounded-2xl p-6 text-center`}>
              <div className="text-3xl font-bold text-gunmetal">{stat.value}</div>
              <div className="text-sm text-gunmetal/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div id="features" className="mt-24 grid md:grid-cols-3 gap-6">
          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-card-pink rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-gunmetal mb-2">Guest Management</h3>
            <p className="text-gunmetal/60">
              Track RSVPs, manage guest lists, and send invitations effortlessly.
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-card-yellow rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold text-gunmetal mb-2">Budget Tracking</h3>
            <p className="text-gunmetal/60">
              Set budgets, track expenses, and stay on top of your spending.
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-card-blue rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gunmetal mb-2">Vendor Booking</h3>
            <p className="text-gunmetal/60">
              Find and book photographers, caterers, decorators, and more.
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-card-purple rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold text-gunmetal mb-2">Task Checklist</h3>
            <p className="text-gunmetal/60">
              Never miss a deadline with smart task management and reminders.
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-card-green rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gunmetal mb-2">Reports & Analytics</h3>
            <p className="text-gunmetal/60">
              Get insights on your wedding planning progress at a glance.
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-light-blue rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🔔</span>
            </div>
            <h3 className="text-xl font-semibold text-gunmetal mb-2">Smart Reminders</h3>
            <p className="text-gunmetal/60">
              Automated notifications for tasks, payments, and events.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gunmetal text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/60">
            © 2025 WedPlan. Made with 💛 for your special day.
          </p>
        </div>
      </footer>
    </div>
  )
}