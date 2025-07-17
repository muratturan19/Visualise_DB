import React, { useState } from 'react'
import {
  Avatar as MTAvatar,
  Button as MTButton,
  Card as MTCard,
  CardBody as MTCardBody,
  Textarea as MTTextarea,
  Typography as MTTypography,
} from '@material-tailwind/react'

const Avatar = MTAvatar as any
const Button = MTButton as any
const Card = MTCard as any
const CardBody = MTCardBody as any
const Textarea = MTTextarea as any
const Typography = MTTypography as any
import DataTable from './components/DataTable'
import ChartView from './components/ChartView'
import SchemaExplorer from './components/SchemaExplorer'
import Spinner from './components/Spinner'
import { queryDatabase, type VisualSpec } from './api'

function normalizeInput(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR')
}

export default function App() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<VisualSpec[] | null>(null)
  const [sql, setSql] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const normalized = normalizeInput(question)
      const res = await queryDatabase(normalized)
      setSql(res.sql)
      setResult(res.visuals)
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <Typography variant="h4" className="font-bold">
            Visual DataBase
          </Typography>
          <Avatar variant="circular" className="bg-gray-300 w-8 h-8" />
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-4 lg:col-span-3 flex flex-col space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                label="Sorunuzu yazın"
                className="min-h-[120px]"
                value={question}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setQuestion(e.target.value)
                }
              />
              <Button
                type="submit"
                color="blue"
                className="w-full text-base"
                disabled={loading || !question.trim()}
              >
                {loading ? 'Çalışıyor...' : 'ASK'}
              </Button>
            </form>
            {error && <Typography color="red">{error}</Typography>}
            {loading && (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            )}
            {result && (
              <div className="space-y-6">
                {result.map((vis, idx) => (
                  <Card key={idx}>
                    <CardBody className="space-y-4">
                      {vis.type !== 'table' && vis.x && vis.y && (
                        <Typography variant="h6">
                          {Array.isArray(vis.y) ? vis.y.join(', ') : vis.y} vs {vis.x}
                        </Typography>
                      )}
                      {sql && (
                        <Typography variant="small" className="break-all font-mono">
                          {sql}
                        </Typography>
                      )}
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
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <div className="col-span-4 lg:col-span-1">
            <Card className="shadow">
              <CardBody className="space-y-2">
                <Typography variant="h6">Schema Explorer</Typography>
                <SchemaExplorer onSelect={handleFieldSelect} />
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
