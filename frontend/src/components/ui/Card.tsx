import React from 'react'

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export default function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`bg-neutral-white dark:bg-brand-secondary rounded-2xl shadow-xl border border-neutral-medium dark:border-neutral-dark hover:shadow-2xl transition-shadow ${className}`}
    />
  )
}
