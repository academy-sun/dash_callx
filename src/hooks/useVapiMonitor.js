import { useState, useEffect, useCallback } from 'react'

const POLL_INTERVAL = 15000 // 15 segundos

export function useVapiMonitor() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/data')

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const json = await response.json()
      setData(json)
      setLastUpdate(json.timestamp)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar dados VAPI:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Busca inicial
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Polling automático
  useEffect(() => {
    const interval = setInterval(fetchData, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  // Assistentes ordenados: em chamada primeiro, depois por nome
  const assistants = data?.assistants
    ? [...data.assistants].sort((a, b) => {
        if (a.isInCall && !b.isInCall) return -1
        if (!a.isInCall && b.isInCall) return 1
        return (a.name || '').localeCompare(b.name || '', 'pt-BR')
      })
    : []

  return {
    assistants,
    stats: data?.stats,
    orgs: data?.orgs,
    isLoading,
    error,
    lastUpdate,
    refetch: fetchData
  }
}
