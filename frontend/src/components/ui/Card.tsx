import React from 'react'

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export default function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`bg-white dark:bg-slate-700 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-500 hover:shadow-2xl transition-shadow ${className}`}
    />
  )
}
