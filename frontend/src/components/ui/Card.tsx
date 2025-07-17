import React from 'react'

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export default function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`bg-gradient-card dark:bg-gradient-to-br dark:from-brand-secondary dark:to-brand-primary rounded-2xl shadow-xl border border-neutral-medium dark:border-neutral-dark hover:shadow-2xl transition-shadow ${className}`}
    />
  )
}
