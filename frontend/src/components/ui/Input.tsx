import React from 'react'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full rounded border border-neutral-medium dark:border-neutral-dark bg-white dark:bg-neutral-dark px-3 py-2 text-neutral-black dark:text-neutral-light placeholder-neutral-dark dark:placeholder-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    />
  )
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full rounded border border-neutral-medium dark:border-neutral-dark bg-white dark:bg-neutral-dark px-3 py-2 text-neutral-black dark:text-neutral-light placeholder-neutral-dark dark:placeholder-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    />
  )
}
