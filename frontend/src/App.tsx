import { useState } from 'react'
import DataTable from './components/DataTable'
import ChartView from './components/ChartView'
import HistoryList, { type HistoryItem } from './components/HistoryList'
import { queryDatabase } from './api'
import './App.css'

function App() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<HistoryItem | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await queryDatabase(question)
      const item: HistoryItem = { question, ...res }
      setResult(item)
      setHistory([item, ...history.slice(0, 9)])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>Natural Language SQL Demo</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question in Turkish or English"
        />
        <button type="submit" disabled={loading || !question.trim()}>
          {loading ? 'Loading...' : 'Ask'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div className="results">
          <h3>SQL</h3>
          <pre className="sql">{result.sql}</pre>
          {result.chart_type === 'table' ? (
            <DataTable data={result.data} />
          ) : (
            <ChartView
              data={result.data}
              chartType={result.chart_type}
              x={result.x!}
              y={result.y!}
            />
          )}
        </div>
      )}
      <HistoryList items={history} onSelect={(item) => setResult(item)} />
    </div>
  )
}

export default App
