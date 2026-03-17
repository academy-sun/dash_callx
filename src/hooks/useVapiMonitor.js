import { useState, useEffect, useCallback, useRef } from 'react'

const POLL_INTERVAL = 15000

// Ordena apenas na PRIMEIRA carga — depois os agentes ficam fixos
function sortInitial(list) {
  const getLastMs = (a) =>
    a.lastCall ? new Date(a.lastCall.createdAt || a.lastCall.startedAt || 0).getTime() : 0

  return [...list].sort((a, b) => {
    // 1. Em chamada primeiro
    if (a.isInCall !== b.isInCall) return a.isInCall ? -1 : 1
    // 2. Entre os em chamada: mais recente primeiro
    if (a.isInCall && b.isInCall) {
      const aT = a.currentCall?.startedAt ? new Date(a.currentCall.startedAt).getTime() : 0
      const bT = b.currentCall?.startedAt ? new Date(b.currentCall.startedAt).getTime() : 0
      return bT - aT
    }
    // 3. Ociosos: última chamada mais recente primeiro
    const diff = getLastMs(b) - getLastMs(a)
    if (diff !== 0) return diff
    // 4. Sem histórico: ordem alfabética
    return (a.name || '').localeCompare(b.name || '', 'pt-BR')
  })
}

// Mescla dado novo com o histórico estável de um agente
function mergeWithPrev(incoming, prevAgent) {
  let bestLastCall = incoming.lastCall ?? null

  if (prevAgent?.lastCall) {
    const prevMs = new Date(prevAgent.lastCall.createdAt || prevAgent.lastCall.startedAt || 0).getTime()
    const inMs   = bestLastCall
      ? new Date(bestLastCall.createdAt || bestLastCall.startedAt || 0).getTime()
      : 0
    if (prevMs > inMs) bestLastCall = prevAgent.lastCall
  }

  return { ...incoming, lastCall: bestLastCall }
}

export function useVapiMonitor() {
  const [data, setData]             = useState(null)
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  // ── Roster estável: Map<agentId, agentData>
  //
  // O Map preserva a ordem de inserção. Isso significa:
  //   - map.set(existingKey, newValue) → atualiza o dado MAS NÃO MUDA A POSIÇÃO
  //   - map.set(newKey, value)         → insere no final
  //
  // Resultado: agentes nunca mudam de posição na tela após a primeira carga.
  // Contagem só cresce, nunca diminui → fim do flickering.
  //
  // null = ainda não inicializado (antes do primeiro fetch completar)
  const stableRoster = useRef(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/data')
      if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`)

      const json     = await response.json()
      const incoming = json.assistants || []

      if (stableRoster.current === null) {
        // ── PRIMEIRA CARGA: sorteia e fixa posições ──────────────────────────
        const merged = incoming.map(a => mergeWithPrev(a, null))
        const sorted = sortInitial(merged)
        stableRoster.current = new Map(sorted.map(a => [a.id, a]))

      } else {
        // ── POLLS SEGUINTES: atualiza dados sem alterar a ordem ──────────────
        // Regra: map.set() em chave EXISTENTE não muda sua posição no Map.
        // Novos agentes (id não visto antes) são append no final.
        incoming.forEach(a => {
          const prev   = stableRoster.current.get(a.id)
          const merged = mergeWithPrev(a, prev)
          stableRoster.current.set(a.id, merged)
        })
      }

      const assistants = Array.from(stableRoster.current.values())

      setData({ ...json, assistants })
      setLastUpdate(json.timestamp)

    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar dados MX3:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    const iv = setInterval(fetchData, POLL_INTERVAL)
    return () => clearInterval(iv)
  }, [fetchData])

  const assistants = data?.assistants ?? []

  return { assistants, stats: data?.stats, orgs: data?.orgs, isLoading, error, lastUpdate, refetch: fetchData }
}
