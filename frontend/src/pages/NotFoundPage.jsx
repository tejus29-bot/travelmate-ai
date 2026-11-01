import React from 'react'
import { Link } from 'react-router-dom'
import { Plane, Compass, Home, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-card p-8 sm:p-12 space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
          <Compass size={40} className="animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-navy-950 block">404</span>
          <h1 className="text-xl font-bold text-slate-900">
            Off the Beaten Path?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The page or itinerary you are looking for doesn't exist or has moved to another destination.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="secondary" size="md" leftIcon={<Home size={16} />}>
              Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="primary" size="md" leftIcon={<ArrowLeft size={16} />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
