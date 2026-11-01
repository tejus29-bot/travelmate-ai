import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plane, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, isDemoMode } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    const { user, error: authError } = await signIn({ email, password })
    setLoading(false)

    if (authError) {
      setError(authError.message || 'Invalid credentials')
    } else {
      toast.success('Welcome back to TravelMate AI!')
      navigate(from, { replace: true })
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    await signIn({ email: 'demo@travelmate.ai', password: 'password123' })
    setLoading(false)
    toast.success('Logged in with Demo Account!')
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-50 to-transparent pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center shadow-glow">
            <Plane size={20} className="text-white" />
          </div>
          <span className="font-extrabold text-navy-950 text-2xl tracking-tight">
            TravelMate<span className="text-brand-500"> AI</span>
          </span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
            create a free account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-3xl border border-slate-200/90 space-y-6"
        >
          {/* Quick Demo Mode Login Banner */}
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700">
                <Sparkles size={14} />
                Instant Demo Access
              </div>
              <p className="text-xs text-brand-900/80 mt-0.5">
                No credentials needed to explore all features.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleDemoLogin}
              loading={loading}
              className="flex-shrink-0"
            >
              Demo Sign In
            </Button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              required
              autoComplete="email"
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-500"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="dark"
              size="lg"
              fullWidth
              loading={loading}
              rightIcon={<ArrowRight size={16} />}
              className="mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Protected with Supabase Authentication & RLS
          </div>
        </motion.div>
      </div>
    </div>
  )
}
