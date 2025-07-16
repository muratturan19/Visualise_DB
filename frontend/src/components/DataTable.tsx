
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
    const isNumeric =
      typeof val === 'number' ||
      (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val)))

    if (isNumeric) {
      const num = Number(val)
      const formatted = num.toLocaleString('tr-TR', {
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
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-left font-semibold"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="even:bg-gray-50 dark:even:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {headers.map((h) => {
                const val = row[h]
                const isNumeric =
                  typeof val === 'number' ||
                  (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val)))
                const num = isNumeric ? Number(val) : 0
                const colorClass =
                  isNumeric && num < 0
                    ? 'text-red-600'
                    : isNumeric && num > 0
                    ? 'text-green-600'
                    : ''

                return (
                  <td
                    key={h}
                    className={`px-2 py-1 border border-gray-300 dark:border-gray-600 ${colorClass}`}
                  >
                    {formatValue(val, row)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
