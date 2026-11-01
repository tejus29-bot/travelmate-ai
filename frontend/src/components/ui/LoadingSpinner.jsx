import React from 'react'
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ fullPage = false, size = 'md', text = '' }) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 40,
    xl: 56,
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2
        size={sizes[size] || sizes.md}
        className="animate-spin text-brand-500"
      />
      {text && (
        <p className="text-slate-500 text-sm font-medium animate-pulse">{text}</p>
      )}
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    )
  }

  return spinner
}

export function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center shadow-glow">
            <span className="text-2xl">✈️</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
            <Loader2 size={12} className="animate-spin text-brand-500" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-800">TravelMate AI</p>
          <p className="text-sm text-slate-500 animate-pulse">{text}</p>
        </div>
      </div>
    </div>
  )
}

export function InlineLoader({ text = 'Loading...' }) {
  return (
    <div className="flex items-center gap-2 text-slate-500">
      <Loader2 size={16} className="animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  )
}
