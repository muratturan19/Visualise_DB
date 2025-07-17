import { useState } from 'react'
import companyLogo from '../assets/react.svg'
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
    <header className="bg-gray-100 dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center h-16 px-4">
        <div className="flex items-center gap-3">
          <img src={companyLogo} alt="Company logo" className="w-10 h-10" />
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            Visual DataBase
          </span>
        </div>
        <nav className="flex-1 flex justify-center gap-6 text-sm font-medium">
          {nav.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="hover:underline text-black dark:text-white"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3 relative">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
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
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">User menu</span>
            <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-500" />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded shadow-md z-10">
              <button
                onClick={() => {
                  setOpen(false)
                  // TODO: implement settings behaviour
                }}
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
