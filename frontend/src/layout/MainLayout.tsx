import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

interface Props {
  children: React.ReactNode
  onFieldSelect: (field: string) => void
}

export default function MainLayout({ children, onFieldSelect }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onFieldSelect={onFieldSelect} />
        <main className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-800">
          {children}
        </main>
      </div>
    </div>
  )
}
