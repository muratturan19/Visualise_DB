import { useState } from 'react'
import companyLogo from '../assets/react.svg'
import {
  Cog6ToothIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
} from '@heroicons/react/24/outline'
import SearchBar from '../components/SearchBar'
import { useTheme } from '../hooks/useTheme'

export default function Header() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const nav = [
    { label: 'Home', href: '#' },
    { label: 'Queries', href: '#' },
    { label: 'Reports', href: '#' },
    { label: 'Analytics', href: '#' },
  ]

  return (
    <header className="h-20 bg-blue-900 dark:bg-blue-950 text-white shadow-xl">
      <div className="w-full flex items-center justify-between h-full pl-2 pr-8">
        <div className="flex items-center gap-3">
          <img src={companyLogo} alt="Company logo" className="w-10 h-10" />
          <span className="font-bold text-lg text-white">
            Visual DataBase
          </span>
        </div>
        <nav className="flex-1 flex justify-center gap-6 text-sm font-medium">
          {nav.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="hover:underline text-white"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3 relative">
          <SearchBar />
          <button
            type="button"
            onClick={toggleTheme}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-800 text-blue-200 dark:bg-blue-700 dark:text-blue-200"
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
          className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-800 text-blue-200 dark:bg-blue-700 dark:text-blue-200"
          >
            <span className="sr-only">Notifications</span>
            <BellIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-800 dark:bg-blue-700"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">User menu</span>
            <div className="w-7 h-7 rounded-full bg-blue-200 dark:bg-blue-500" />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded shadow-md z-10">
              <button
                onClick={() => {
                  setOpen(false)
                  // TODO: implement settings behaviour
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-800"
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
