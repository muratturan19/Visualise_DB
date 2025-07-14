export interface QueryRequest {
  question: string
}

export interface QueryResponse {
  sql: string
  chart_type: 'table' | 'bar' | 'line' | 'scatter'
  x?: string
  y?: string
  data: any[]
}

export async function queryDatabase(question: string): Promise<QueryResponse> {
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'API error')
  }
  return res.json()
}
