export interface QueryRequest {
  question: string
}

export interface VisualSpec {
  type: 'table' | 'bar' | 'line' | 'scatter'
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
export async function queryDatabase(question: string): Promise<QueryResponse> {
  // Debug log of the exact payload being sent
  console.log('POST /api/query payload:', { question })
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
