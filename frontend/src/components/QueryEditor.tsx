import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { useQueryHistory } from '../hooks/useQueryHistory'

interface Props {
  value: string
  onChange: (val: string) => void
  error?: string
  disabled?: boolean
}

export default function QueryEditor({ value, onChange, error, disabled }: Props) {
  const { history } = useQueryHistory()

  return (
    <div className="space-y-2">
      <CodeMirror
        value={value}
        height="120px"
        extensions={[sql()]}
        onChange={(val) => onChange(val)}
        editable={!disabled}
        className={`border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {history.length > 0 && (
        <select
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border border-gray-300 dark:border-gray-600 p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Recent Queries</option>
          {history.map((h, idx) => (
            <option key={idx} value={h}>
              {h}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
