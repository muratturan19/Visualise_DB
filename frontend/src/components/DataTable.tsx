
interface Props {
  data: any[]
}

export default function DataTable({ data }: Props) {
  if (!data || data.length === 0) {
    return <p>No results.</p>
  }

  const headers = Object.keys(data[0])

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
                <td key={h}>{String(row[h])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
