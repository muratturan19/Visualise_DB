import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import { Cog6ToothIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../hooks/useTheme'

export default function Header() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const nav = [
    { label: 'Home', href: '#' },
    { label: 'History', href: '#' },
  ]

  return (
    <header className="bg-primary text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <img src={reactLogo} alt="logo" className="w-8 h-8" />
          <nav className="hidden md:flex gap-4 text-sm">
            {nav.map((n) => (
              <a key={n.label} href={n.href} className="hover:underline">
                {n.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 relative">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
          >
            <span className="sr-only">Toggle theme</span>
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">User menu</span>
            <div className="w-6 h-6 rounded-full bg-gray-200" />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded shadow-md z-10">
              <button
                className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Cog6ToothIcon className="w-4 h-4" /> Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
