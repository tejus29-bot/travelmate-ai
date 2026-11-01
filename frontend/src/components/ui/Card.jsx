import React from 'react'

const variants = {
  default: 'bg-white border border-slate-200 shadow-card',
  elevated: 'bg-white shadow-card-hover border border-slate-100',
  flat: 'bg-slate-50 border border-slate-100',
  glass: 'glass',
  dark: 'bg-navy-950 border border-white/10 text-white',
  gradient: 'bg-gradient-to-br from-brand-500 to-sky-500 text-white border-0',
}

export default function Card({
  children,
  variant = 'default',
  hover = false,
  className = '',
  padding = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl transition-all duration-200
        ${variants[variant] || variants.default}
        ${padding ? 'p-6' : ''}
        ${hover ? 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-slate-900 ${className}`}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-slate-100 ${className}`}>
      {children}
    </div>
  )
}
