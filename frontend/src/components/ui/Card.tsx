import React from 'react'

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export default function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-shadow ${className}`}
    />
  )
}
