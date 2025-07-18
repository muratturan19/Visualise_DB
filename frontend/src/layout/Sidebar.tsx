import { useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  DocumentMagnifyingGlassIcon,
  DocumentChartBarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import SchemaExplorer from '../components/SchemaExplorer'

interface Props {
  onFieldSelect: (field: string) => void
}

export default function Sidebar({ onFieldSelect }: Props) {
  const [open, setOpen] = useState(true)
  const nav = [
    { label: 'Home', href: '#', icon: HomeIcon },
    { label: 'Queries', href: '#', icon: DocumentMagnifyingGlassIcon },
    { label: 'Reports', href: '#', icon: DocumentChartBarIcon },
    { label: 'Analytics', href: '#', icon: ChartBarIcon },
  ]

  return (
    <aside
      className={`bg-blue-50 dark:bg-blue-950 border-r border-blue-200 dark:border-blue-900 overflow-y-auto transition-all duration-300 ${open ? 'w-[280px]' : 'w-16'}`}
    >
      <div className="flex items-center justify-between p-2">
        {open && <span className="font-semibold text-blue-900 dark:text-blue-100">Menu</span>}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800"
        >
          {open ? (
            <ChevronLeftIcon className="w-5 h-5" />
          ) : (
            <ChevronRightIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      <nav className="px-2 space-y-1 text-sm">
        {nav.map((n) => (
          <a
            key={n.label}
            href={n.href}
            className="flex items-center gap-2 px-2 py-1 rounded text-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-800"
          >
            {n.icon && <n.icon className="w-5 h-5 text-blue-400" />}
            {open && n.label}
          </a>
        ))}
      </nav>
      {open && (
        <div className="p-2">
          <SchemaExplorer onSelect={onFieldSelect} />
        </div>
      )}
    </aside>
  )
}
