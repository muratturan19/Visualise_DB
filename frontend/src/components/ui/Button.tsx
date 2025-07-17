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
    // Provide a fallback to Tailwind's blue palette in case custom colors from
    // tailwind.config.ts are not available.
    primary:
      'bg-gradient-to-r from-brand-accent to-accent-dark text-white',
    // Secondary buttons get a neutral style for light and dark modes.
    secondary:
      'bg-neutral-light dark:bg-neutral-dark border border-neutral-medium text-neutral-dark dark:text-neutral-light hover:bg-neutral-medium/50',
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
