
import type { VisualSpec } from '../api'

export interface HistoryItem {
  question: string
  sql: string
  visuals: VisualSpec[]
}

interface Props {
  items: HistoryItem[]
  onSelect: (item: HistoryItem) => void
}

export default function HistoryList({ items, onSelect }: Props) {
  return (
    <div>
      <h3 className="font-semibold mb-2">History</h3>
      {items.length === 0 && <p>No history yet.</p>}
      <div className="space-y-2">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="cursor-pointer border border-gray-300 dark:border-gray-600 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => onSelect(it)}
          >
            <p>{it.question}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
