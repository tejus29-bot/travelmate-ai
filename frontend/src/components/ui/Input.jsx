import React, { forwardRef } from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    type = 'text',
    className = '',
    containerClassName = '',
    required,
    disabled,
    onRightIconClick,
    ...props
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={`
            block w-full rounded-xl border transition-all duration-150
            text-slate-900 placeholder-slate-400 text-sm
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            py-2.5
            ${error
              ? 'border-red-300 bg-red-50 focus:ring-red-400 focus:border-red-400'
              : 'border-slate-200 bg-white focus:ring-brand-400 focus:border-brand-400 hover:border-slate-300'
            }
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            tabIndex={-1}
            className="absolute right-3 text-slate-400 hover:text-slate-600 flex items-center focus:outline-none"
          >
            {rightIcon}
          </button>
        )}
        {error && !rightIcon && (
          <div className="absolute right-3 text-red-400 pointer-events-none flex items-center">
            <AlertCircle size={16} />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  )
})

export default Input
