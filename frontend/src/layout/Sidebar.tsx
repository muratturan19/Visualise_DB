import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import SchemaExplorer from '../components/SchemaExplorer'

interface Props {
  onFieldSelect: (field: string) => void
}

export default function Sidebar({ onFieldSelect }: Props) {
  const [open, setOpen] = useState(true)
  const nav = [
    { label: 'Queries', href: '#' },
    { label: 'Reports', href: '#' },
  ]

  return (
    <aside
      className={`bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-700 overflow-y-auto transition-all duration-300 ${open ? 'w-64' : 'w-16'}`}
    >
      <div className="flex items-center justify-between p-2">
        {open && <span className="font-semibold">Menu</span>}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {open ? (
            <ChevronLeftIcon className="w-5 h-5" />
          ) : (
            <ChevronRightIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      {open && (
        <nav className="px-2 space-y-1 text-sm">
          {nav.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="block px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {n.label}
            </a>
          ))}
        </nav>
      )}
      {open && (
        <div className="p-2">
          <SchemaExplorer onSelect={onFieldSelect} />
        </div>
      )}
    </aside>
  )
}
