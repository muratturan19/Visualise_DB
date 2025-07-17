export interface QueryRequest {
  question: string
  context?: string[]
}

export interface VisualSpec {
  type: 'table' | 'bar' | 'line' | 'scatter' | 'pie' | 'doughnut'
  x?: string
  y?: string | string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
}

export interface QueryResponse {
  sql: string
  visuals: VisualSpec[]
}

// Question should already be normalised before calling this function
export async function queryDatabase(question: string, context: string[] = []): Promise<QueryResponse> {
  // Debug log of the exact payload being sent
  console.log('POST /api/query payload:', { question, context })
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, context }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'API error')
  }
  const data = await res.json()
  // Debug log: inspect API response as soon as we receive it
  console.log('API response:', data)
  return data
}

export interface SchemaField {
  name: string
  type: string
  friendly?: string
  fk?: { table: string; column: string }
}

export interface SchemaTable {
  name: string
  friendly?: string
  columns: SchemaField[]
}

export interface SchemaResponse {
  tables: SchemaTable[]
}

export async function fetchSchema(): Promise<SchemaResponse> {
  const res = await fetch('/api/schema')
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'API error')
  }
  return await res.json()
}
