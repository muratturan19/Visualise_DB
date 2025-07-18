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
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary:
      'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 border border-blue-300 dark:border-blue-600 text-blue-900 dark:text-blue-100',
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
