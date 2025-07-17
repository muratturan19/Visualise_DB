import React from 'react'

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export default function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`bg-gradient-to-br from-neutral-white to-neutral-light dark:from-neutral-dark dark:to-neutral-black rounded-2xl shadow-xl border border-neutral-medium dark:border-neutral-dark hover:shadow-2xl transition-shadow ${className}`}
    />
  )
}
