import React from 'react'

const variants = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-brand-100 text-brand-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-600',
  info: 'bg-sky-100 text-sky-700',
  purple: 'bg-purple-100 text-purple-700',
  dark: 'bg-navy-950 text-white',
  'gradient-blue': 'bg-gradient-to-r from-brand-500 to-sky-500 text-white',
}

const sizes = {
  xs: 'px-1.5 py-0.5 text-xs rounded-md',
  sm: 'px-2 py-1 text-xs rounded-lg',
  md: 'px-2.5 py-1 text-xs rounded-lg',
  lg: 'px-3 py-1.5 text-sm rounded-xl',
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium
        ${variants[variant] || variants.default}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-70`} />
      )}
      {children}
    </span>
  )
}
