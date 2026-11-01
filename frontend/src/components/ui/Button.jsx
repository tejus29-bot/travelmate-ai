import React from 'react'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow-md active:scale-[0.98]',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
  outline: 'border border-brand-500 text-brand-600 hover:bg-brand-50 bg-transparent',
  ghost: 'text-slate-600 hover:bg-slate-100 bg-transparent',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  'gradient': 'bg-gradient-to-r from-brand-500 to-sky-500 hover:from-brand-600 hover:to-sky-600 text-white shadow-glow hover:shadow-glow-lg active:scale-[0.98]',
  'dark': 'bg-navy-950 hover:bg-navy-900 text-white shadow-sm',
  'white': 'bg-white hover:bg-slate-50 text-navy-950 shadow-sm border border-slate-200',
}

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg gap-1',
  sm: 'px-3 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
  xl: 'px-8 py-4 text-lg rounded-2xl gap-2.5',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  )
}
