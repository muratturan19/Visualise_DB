import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { lineNumbers } from '@codemirror/view'
import { autocompletion } from '@codemirror/autocomplete'
import { oneDark } from '@codemirror/theme-one-dark'
import { useQueryHistory } from '../hooks/useQueryHistory'
import { useTheme } from '../hooks/useTheme'

interface Props {
  value: string
  onChange: (val: string) => void
  error?: string
  disabled?: boolean
}

export default function QueryEditor({ value, onChange, error, disabled }: Props) {
  const { history } = useQueryHistory()
  const { theme } = useTheme()

  return (
    <div className="space-y-2">
      <CodeMirror
        value={value}
        height="120px"
        extensions={[sql(), lineNumbers(), autocompletion()]}
        theme={theme === 'dark' ? oneDark : 'light'}
        onChange={(val) => onChange(val)}
        editable={!disabled}
        className={`border rounded ${error ? 'border-red-500' : 'border-blue-200 dark:border-blue-700'}`}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {history.length > 0 && (
        <select
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border border-blue-200 dark:border-blue-700 p-1 bg-white dark:bg-blue-900 text-blue-900 dark:text-blue-100"
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
