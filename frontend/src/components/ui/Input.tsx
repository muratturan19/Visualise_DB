import React from 'react'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-blue-900 px-3 py-2 text-blue-900 dark:text-blue-100 placeholder-blue-400 dark:placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-800 ${className}`}
    />
  )
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-blue-900 px-3 py-2 text-blue-900 dark:text-blue-100 placeholder-blue-400 dark:placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-800 ${className}`}
    />
  )
}
