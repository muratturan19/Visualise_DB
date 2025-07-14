export interface QueryRequest {
  question: string
}

export interface QueryResponse {
  sql: string
  chart_type: 'table' | 'bar' | 'line' | 'scatter'
  x?: string
  y?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
}

// Question should already be normalised before calling this function
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
  const data = await res.json()
  // Debug log: inspect API response as soon as we receive it
  console.log('API response:', data)
  return data
}
