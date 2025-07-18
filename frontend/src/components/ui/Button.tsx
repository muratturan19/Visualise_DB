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
    primary:
      'bg-brand-accent text-white',
    secondary:
      'bg-neutral-light dark:bg-brand-secondary border border-neutral-medium text-brand-secondary dark:text-neutral-light hover:bg-neutral-medium/50',
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
