import React, { useState } from 'react'
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import QueryEditor from './components/QueryEditor'
import DataTable from './components/DataTable'
import ChartView from './components/charts/ChartView'
import SchemaExplorer from './components/SchemaExplorer'
import Spinner from './components/Spinner'
import { queryDatabase, type VisualSpec } from './api'
import { useQueryHistory } from './hooks/useQueryHistory'

function normalizeInput(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR')
}

export default function App() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<VisualSpec[] | null>(null)
  const [sql, setSql] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const { addQuery } = useQueryHistory()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFormError('')
    if (!question.trim()) {
      setFormError('Query cannot be empty')
      return
    }
    setLoading(true)
    try {
      const normalized = normalizeInput(question)
      const res = await queryDatabase(normalized)
      setSql(res.sql)
      setResult(res.visuals)
      addQuery(question)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleFieldSelect = (field: string) => {
    setQuestion((q) => (q ? q + ' ' + field : field))
  }

  const handleSave = () => {
    if (question.trim()) {
      localStorage.setItem('savedQuery', question)
    }
  }

  const handleLoad = () => {
    const saved = localStorage.getItem('savedQuery')
    if (saved) setQuestion(saved)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Visual DataBase</h1>
          <div className="w-8 h-8 rounded-full bg-gray-300" />
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-4 lg:col-span-3 flex flex-col space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <QueryEditor
                value={question}
                onChange={setQuestion}
                error={formError}
                disabled={loading}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 text-base"
                  disabled={loading || !question.trim()}
                >
                  {loading ? 'Çalışıyor...' : 'ASK'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSave}
                  disabled={!question.trim()}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleLoad}
                >
                  Load
                </Button>
              </div>
            </form>
            {error && <p className="text-red-600">{error}</p>}
            {loading && (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            )}
            {result && (
              <div className="space-y-6">
                {result.map((vis, idx) => (
                  <Card key={idx}>
                    <div className="p-4 space-y-4">
                      {vis.type !== 'table' && vis.x && vis.y && (
                        <h2 className="text-lg font-semibold">
                          {Array.isArray(vis.y) ? vis.y.join(', ') : vis.y} vs {vis.x}
                        </h2>
                      )}
                      {sql && (
                        <p className="text-sm break-all font-mono">{sql}</p>
                      )}
                      {vis.type === 'table' ? (
                        <DataTable data={vis.data} />
                      ) : (
                        <ChartView
                          data={vis.data}
                          chartType={
                            vis.type as
                              | 'bar'
                              | 'line'
                              | 'scatter'
                              | 'pie'
                              | 'doughnut'
                          }
                          x={vis.x!}
                          y={vis.y!}
                        />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <div className="col-span-4 lg:col-span-1">
            <Card className="shadow">
              <div className="p-2 space-y-2">
                <h2 className="text-lg font-semibold">Schema Explorer</h2>
                <SchemaExplorer onSelect={handleFieldSelect} />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
