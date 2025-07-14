
export interface HistoryItem {
  question: string
  sql: string
  chart_type: 'table' | 'bar' | 'line' | 'scatter'
  x?: string
  y?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
}

interface Props {
  items: HistoryItem[]
  onSelect: (item: HistoryItem) => void
}

export default function HistoryList({ items, onSelect }: Props) {
  return (
    <div className="history">
      <h3>History</h3>
      {items.length === 0 && <p>No history yet.</p>}
      {items.map((it, idx) => (
        <div key={idx} className="history-item" onClick={() => onSelect(it)}>
          <p className="question">{it.question}</p>
          <pre className="sql">{it.sql}</pre>
        </div>
      ))}
    </div>
  )
}
