import { useEffect, useState } from 'react'
import type { SchemaResponse, SchemaTable } from '../api'
import { fetchSchema } from '../api'

interface Props {
  onSelect: (field: string) => void
}

export default function SchemaExplorer({ onSelect }: Props) {
  const [schema, setSchema] = useState<SchemaTable[] | null>(null)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetchSchema()
      .then((data: SchemaResponse) => setSchema(data.tables))
      .catch((err) => {
        console.error(err)
        setFailed(true)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div>Loading schema...</div>
  }

  if (failed || !schema) {
    return null
  }

  const filtered = schema.map((tbl) => {
    const tblLabel = tbl.friendly ?? tbl.name
    return {
      ...tbl,
      columns: (tbl.columns ?? []).filter((c) => {
        const searchTarget = (
          tblLabel + '.' + (c.friendly ?? c.name)
        ).toLowerCase()
        return searchTarget.includes(filter.toLowerCase())
      }),
    }
  })

  return (
    <div className="bg-white dark:bg-blue-900 rounded-lg shadow p-2 overflow-y-auto max-h-[80vh] w-full">
      <h3 className="font-semibold mb-2 text-lg text-blue-700 dark:text-blue-300">Schema Explorer</h3>
      <input
        type="text"
        placeholder="Search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full mb-2 rounded border border-blue-200 dark:border-blue-700 bg-blue-100 dark:bg-blue-800 placeholder-blue-400 p-1"
      />
      <div className="space-y-2">
        {filtered.map((tbl) => (
          <div key={tbl.name} className="space-y-1">
            <strong>{tbl.friendly ?? tbl.name}</strong>
            <ul className="list-none pl-2 space-y-1">
              {(tbl.columns ?? []).map((col) => (
                <li
                  key={col.name}
                  className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-300"
                  title={col.fk ? `FK -> ${col.fk.table}.${col.fk.column}` : ''}
                  onClick={() => onSelect(`${tbl.name}.${col.name}`)}
                >
                  {col.friendly ?? col.name}
                  {col.fk && <span className="text-yellow-500 ml-1">*</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
