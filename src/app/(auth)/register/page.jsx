'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'COUPLE'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      router.push('/login?registered=true')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-light-blue/30 via-white to-saffron/20">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gunmetal items-center justify-center p-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="text-saffron">Wed</span>Plan
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            Join thousands of couples who planned their perfect wedding with us.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-3xl font-bold text-saffron">10K+</div>
              <div className="text-white/60 text-sm">Happy Couples</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-3xl font-bold text-light-blue">500+</div>
              <div className="text-white/60 text-sm">Vendors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="text-2xl font-bold text-gunmetal lg:hidden">
              <span className="text-moonstone">Wed</span>Plan
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gunmetal">
              Create your account
            </h2>
            <p className="mt-2 text-gunmetal/60">
              Start planning your perfect wedding today
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="input-label">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="input-label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="role" className="input-label">I am a</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input"
              >
                <option value="COUPLE">Couple (Planning Wedding)</option>
                <option value="VENDOR">Vendor (Offering Services)</option>
                <option value="GUEST">Guest</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="input-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>

            <p className="text-center text-gunmetal/60">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-moonstone hover:text-moonstone-dark">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}