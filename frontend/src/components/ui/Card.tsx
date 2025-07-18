import React from 'react'

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export default function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`bg-white dark:bg-blue-900 rounded-2xl shadow-xl border border-blue-100 dark:border-blue-700 hover:shadow-2xl transition-shadow ${className}`}
    />
  )
}
