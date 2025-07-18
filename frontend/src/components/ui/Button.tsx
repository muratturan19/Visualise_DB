import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export default function Button({
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'px-8 py-3 rounded-lg font-medium focus:outline-none transition-colors shadow-lg hover:shadow-xl'
  const variants: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary:
      'bg-gray-100 dark:bg-slate-700 border border-slate-200 text-slate-700 dark:text-slate-100 hover:bg-gray-200 dark:hover:bg-slate-600',
  }
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''
  return (
    <button
      {...props}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabledClasses} ${className}`}
    />
  )
}
