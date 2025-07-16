import React, { useState } from 'react'

// Normalise Turkish text by trimming whitespace and applying locale aware
// lowercase. This is performed on submit only so the user can freely type
// spaces while editing the query.
function normalizeInput(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR')
}
import DataTable from './components/DataTable'
import ChartView from './components/ChartView'
import HistoryList, { type HistoryItem } from './components/HistoryList'
import Spinner from './components/Spinner'
import { queryDatabase, type VisualSpec } from './api'
import SchemaExplorer from './components/SchemaExplorer'
import './App.css'

function App() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<HistoryItem | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFields, setSelectedFields] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const normalizedQuestion = normalizeInput(question)
      const res = await queryDatabase(normalizedQuestion, selectedFields)
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

  const handleFieldSelect = (field: string) => {
    setSelectedFields((prev) => Array.from(new Set([...prev, field])))
    setQuestion((q) => (q ? q + ' ' + field : field))
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">Natural Language SQL</h1>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question in Turkish or English"
                className="w-full min-h-[80px] resize-y rounded border border-gray-300 dark:border-gray-600 p-2"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="self-start rounded px-4 py-2 text-white bg-gradient-to-r from-primary to-secondary disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Ask'}
              </button>
            </form>
          </div>
          {loading && (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          {result && (
            <div className="space-y-4">
              {(() => {
                const tableVis = result.visuals.find((v) => v.type === 'table')
                const chartVis = result.visuals.find((v) => v.type !== 'table')
                const remaining = result.visuals.filter(
                  (v) => v !== tableVis && v !== chartVis
                )

                const getTitle = (vis: VisualSpec | undefined) => {
                  if (!vis || vis.type === 'table') return ''
                  const yKeys = Array.isArray(vis.y)
                    ? vis.y
                    : (vis.y ?? '').split(',').map((s) => s.trim())
                  return vis.x && yKeys.length
                    ? `${yKeys.join(', ')} vs ${vis.x}`
                    : ''
                }

                const cards: React.ReactNode[] = []

                if (tableVis && chartVis) {
                  cards.push(
                    <div
                      key="combo"
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2"
                    >
                      <div>
                        {getTitle(chartVis) && (
                          <h3 className="font-semibold mb-1">{getTitle(chartVis)}</h3>
                        )}
                        <p className="text-xs text-gray-500 break-all font-mono">
                          {result.sql}
                        </p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <ChartView
                          data={chartVis.data}
                          chartType={chartVis.type as 'bar' | 'line' | 'scatter'}
                          x={chartVis.x!}
                          y={chartVis.y!}
                        />
                        <DataTable data={tableVis.data} />
                      </div>
                    </div>
                  )
                }

                cards.push(
                  ...remaining.map((vis, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2"
                    >
                      {vis.type !== 'table' && getTitle(vis) && (
                        <h3 className="font-semibold mb-1">{getTitle(vis)}</h3>
                      )}
                      <p className="text-xs text-gray-500 break-all font-mono">
                        {result.sql}
                      </p>
                      {vis.type === 'table' ? (
                        <DataTable data={vis.data} />
                      ) : (
                        <ChartView
                          data={vis.data}
                          chartType={vis.type as 'bar' | 'line' | 'scatter'}
                          x={vis.x!}
                          y={vis.y!}
                        />
                      )}
                    </div>
                  ))
                )

                return cards
              })()}
            </div>
          )}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <HistoryList items={history} onSelect={(item) => setResult(item)} />
          </div>
        </div>
        <SchemaExplorer onSelect={handleFieldSelect} />
      </div>
    </div>
  )
}

export default App
