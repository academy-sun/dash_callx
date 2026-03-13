import { useState, useEffect, useCallback, useRef } from 'react'

const POLL_INTERVAL = 15000

export function useVapiMonitor() {
  const [data, setData]             = useState(null)
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Cache persistente de lastCall por assistantId.
  // A API retorna só as 100 chamadas mais recentes, então um agente
  // pode sumir do histórico entre polls. Guardamos o melhor valor já visto.
  const stableLastCall = useRef({}) // { [id]: lastCallObj }

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/data')
      if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`)

      const json = await response.json()

      // Mescla assistentes com o cache estável
      const merged = (json.assistants || []).map(a => {
        if (a.lastCall) {
          const cached    = stableLastCall.current[a.id]
          const cachedMs  = cached  ? new Date(cached.createdAt  || cached.startedAt  || 0).getTime() : 0
          const incomingMs = new Date(a.lastCall.createdAt || a.lastCall.startedAt || 0).getTime()
          if (incomingMs >= cachedMs) stableLastCall.current[a.id] = a.lastCall
        }
        return {
          ...a,
          lastCall: a.lastCall ?? stableLastCall.current[a.id] ?? null,
        }
      })

      setData({ ...json, assistants: merged })
      setLastUpdate(json.timestamp)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar dados VAPI:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() },                          [fetchData])
  useEffect(() => { const iv = setInterval(fetchData, POLL_INTERVAL); return () => clearInterval(iv) }, [fetchData])

  // Ordenação estável:
  // 1. Em chamada agora (mais recente primeiro pelo startedAt)
  // 2. Idle com histórico (última chamada mais recente primeiro)
  // 3. Sem histórico nenhum (por nome)
  const getLastMs = (a) =>
    a.lastCall ? new Date(a.lastCall.createdAt || a.lastCall.startedAt || 0).getTime() : 0

  const assistants = data?.assistants
    ? [...data.assistants].sort((a, b) => {
        if (a.isInCall !== b.isInCall) return a.isInCall ? -1 : 1
        if (a.isInCall && b.isInCall) {
          const aT = a.currentCall?.startedAt ? new Date(a.currentCall.startedAt).getTime() : 0
          const bT = b.currentCall?.startedAt ? new Date(b.currentCall.startedAt).getTime() : 0
          return bT - aT
        }
        const diff = getLastMs(b) - getLastMs(a)
        if (diff !== 0) return diff
        return (a.name || '').localeCompare(b.name || '', 'pt-BR')
      })
    : []

  return { assistants, stats: data?.stats, orgs: data?.orgs, isLoading, error, lastUpdate, refetch: fetchData }
}
