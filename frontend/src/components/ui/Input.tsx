import React from 'react'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full rounded border border-slate-200 dark:border-slate-500 bg-white dark:bg-slate-500 px-3 py-2 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-800 ${className}`}
    />
  )
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full rounded border border-slate-200 dark:border-slate-500 bg-white dark:bg-slate-500 px-3 py-2 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-800 ${className}`}
    />
  )
}
