'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Something went wrong')
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
            Welcome back! Continue planning your perfect day.
          </p>
          <div className="mt-12">
            <div className="bg-white/10 rounded-2xl p-6 text-left max-w-sm mx-auto">
              <p className="text-white/80 italic">
                "WedPlan made our wedding planning so smooth. We tracked everything in one place!"
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-saffron flex items-center justify-center text-gunmetal font-bold">
                  R
                </div>
                <div>
                  <div className="text-white font-medium">Rahul & Priya</div>
                  <div className="text-white/50 text-sm">Married Dec 2024</div>
                </div>
              </div>
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
              Welcome back
            </h2>
            <p className="mt-2 text-gunmetal/60">
              Sign in to continue planning your wedding
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {registered && (
              <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm border border-green-100">
                ✓ Account created successfully! Please sign in.
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-moonstone focus:ring-moonstone" />
                <span className="text-sm text-gunmetal/70">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-moonstone hover:text-moonstone-dark">
                Forgot password?
              </Link>
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
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>

            <p className="text-center text-gunmetal/60">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-moonstone hover:text-moonstone-dark">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}