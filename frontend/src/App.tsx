import React, { useState } from 'react'
import {
  Card as MTCard,
  CardBody as MTCardBody,
  CardHeader as MTCardHeader,
  Typography as MTTypography,
  Textarea as MTTextarea,
  Button as MTButton,
} from '@material-tailwind/react'

// Cast Material Tailwind components to loosely typed versions to avoid
// excessive generic requirements in TypeScript.
const Card = MTCard as any
const CardBody = MTCardBody as any
const CardHeader = MTCardHeader as any
const Typography = MTTypography as any
const Textarea = MTTextarea as any
const Button = MTButton as any

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
    <div className="min-h-screen p-4">
      <Typography variant="h4" className="mb-4 text-center">
        Visualise DB
      </Typography>
      <div className="mx-auto grid max-w-7xl gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader shadow={false} floated={false} className="p-4">
            <Typography variant="h6">Schema Explorer</Typography>
          </CardHeader>
          <CardBody className="space-y-2">
            <SchemaExplorer onSelect={handleFieldSelect} />
          </CardBody>
        </Card>

        <div className="flex flex-col space-y-4">
          <Card>
            <CardHeader shadow={false} floated={false} className="p-4">
              <Typography variant="h6">Query</Typography>
            </CardHeader>
            <CardBody className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-2">
                <Textarea
                  label="Sorunuzu yazın"
                  className="min-h-[100px]"
                  value={question}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setQuestion(e.target.value)
                  }
                />
                <Button
                  type="submit"
                  color="blue"
                  className="w-32"
                  disabled={loading || !question.trim()}
                >
                  {loading ? 'Çalışıyor...' : 'Çalıştır'}
                </Button>
              </form>
              {error && <Typography color="red">{error}</Typography>}
              {loading && (
                <div className="flex justify-center py-2">
                  <Spinner />
                </div>
              )}
            </CardBody>
          </Card>

          {result && (
            <Card>
              <CardHeader shadow={false} floated={false} className="p-4">
                <Typography variant="h6">Results</Typography>
              </CardHeader>
              <CardBody className="space-y-4">
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
                      <div key="combo" className="space-y-2">
                        <div>
                          {getTitle(chartVis) && (
                            <Typography variant="h6">{getTitle(chartVis)}</Typography>
                          )}
                          <Typography variant="small" className="break-all font-mono">
                            {result.sql}
                          </Typography>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <ChartView data={chartVis.data} chartType={chartVis.type as 'bar' | 'line' | 'scatter'} x={chartVis.x!} y={chartVis.y!} />
                          <DataTable data={tableVis.data} />
                        </div>
                      </div>
                    )
                  }

                  cards.push(
                    ...remaining.map((vis, idx) => (
                      <div key={idx} className="space-y-2">
                        {vis.type !== 'table' && getTitle(vis) && (
                          <Typography variant="h6">{getTitle(vis)}</Typography>
                        )}
                        <Typography variant="small" className="break-all font-mono">
                          {result.sql}
                        </Typography>
                        {vis.type === 'table' ? (
                          <DataTable data={vis.data} />
                        ) : (
                          <ChartView data={vis.data} chartType={vis.type as 'bar' | 'line' | 'scatter'} x={vis.x!} y={vis.y!} />
                        )}
                      </div>
                    ))
                  )

                  return cards
                })()}
              </CardBody>
            </Card>
          )}
        </div>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader shadow={false} floated={false} className="p-4">
            <Typography variant="h6">History</Typography>
          </CardHeader>
          <CardBody className="space-y-2">
            <HistoryList items={history} onSelect={(item) => setResult(item)} />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default App
