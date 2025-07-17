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
    'px-4 py-2 rounded font-medium focus:outline-none transition-colors'
  const variants: Record<string, string> = {
    // Provide a fallback to Tailwind's blue palette in case custom colors from
    // tailwind.config.ts are not available.
    primary:
      'bg-primary bg-blue-600 text-white hover:bg-primary-light hover:bg-blue-700',
    // Fallback to Tailwind's built-in green classes in case custom colors
    // from tailwind.config.ts are not generated.
    secondary:
      'bg-secondary bg-green-600 text-white hover:bg-secondary-light hover:bg-green-700',
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
