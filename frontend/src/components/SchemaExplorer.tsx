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

  const filtered = schema.map((tbl) => ({
    ...tbl,
    columns: (tbl.columns ?? []).filter((c) =>
      (tbl.name + '.' + c.name).toLowerCase().includes(filter.toLowerCase())
    ),
  }))

  return (
    <div className="schema-explorer">
      <h3>Schema Explorer</h3>
      <input
        type="text"
        placeholder="Search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="schema-list">
        {filtered.map((tbl) => (
          <div key={tbl.name} className="table-block">
            <strong>{tbl.name}</strong>
            <ul>
              {(tbl.columns ?? []).map((col) => (
                <li
                  key={col.name}
                  className="column-item"
                  title={col.fk ? `FK -> ${col.fk.table}.${col.fk.column}` : ''}
                  onClick={() => onSelect(`${tbl.name}.${col.name}`)}
                >
                  {col.name}
                  {col.fk && <span className="fk-ind">*</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
