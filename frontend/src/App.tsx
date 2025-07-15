import { useState } from 'react'

// Normalise Turkish text by trimming whitespace and applying locale aware
// lowercase. This is performed on submit only so the user can freely type
// spaces while editing the query.
function normalizeInput(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR')
}
import DataTable from './components/DataTable'
import ChartView from './components/ChartView'
import HistoryList, { type HistoryItem } from './components/HistoryList'
import ProgressBar from './components/ProgressBar'
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
      const normalizedQuestion = normalizeInput(question)
      const res = await queryDatabase(normalizedQuestion)
      const item: HistoryItem = { question: normalizedQuestion, ...res }
      setResult(item)
      setHistory([item, ...history.slice(0, 9)])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>Natural Language SQL</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="query-form">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question in Turkish or English"
          />
          <button type="submit" disabled={loading || !question.trim()}>
            {loading ? 'Loading...' : 'Ask'}
          </button>
        </form>
      </div>
      {loading && (
        <div className="loading">
          <p>Rapor hazırlanıyor...</p>
          <ProgressBar />
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div className="card results">
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
      <div className="card">
        <HistoryList items={history} onSelect={(item) => setResult(item)} />
      </div>
    </div>
  )
}

export default App
