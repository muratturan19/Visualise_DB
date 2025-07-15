
interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
}

export default function DataTable({ data }: Props) {
  if (!data || data.length === 0) {
    return <p>No results.</p>
  }

  const headers = Object.keys(data[0])

  // Format numbers using Turkish locale and append unit if present.
  const formatValue = (val: unknown, row: Record<string, unknown>) => {
    if (typeof val === 'number') {
      const formatted = val.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rowAny = row as any
      const unit =
        rowAny.birim ||
        rowAny.para_birim ||
        rowAny.currency ||
        rowAny.doviz
      return unit ? `${formatted} ${unit}` : formatted
    }
    return String(val)
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {headers.map((h) => (
                <td key={h}>{formatValue(row[h], row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
