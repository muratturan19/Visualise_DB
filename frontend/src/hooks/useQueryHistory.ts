import { useEffect, useState } from 'react'

export function useQueryHistory(max = 10) {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('queryHistory')
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch {
        setHistory([])
      }
    }
  }, [])

  const addQuery = (query: string) => {
    setHistory((prev) => {
      const newHistory = [query, ...prev.filter((q) => q !== query)].slice(0, max)
      localStorage.setItem('queryHistory', JSON.stringify(newHistory))
      return newHistory
    })
  }

  return { history, addQuery }
}
