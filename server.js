const express = require('express')
const cors    = require('cors')
const path    = require('path')

const app = express()
app.use(cors())
app.use(express.json())

// ─── Carrega configuração das organizações ──────────────────────────────────
// Prioridade: VAPI_ORGS (env, para Render) → orgs.config.js (local)
let orgs = []

if (process.env.VAPI_ORGS) {
  try {
    orgs = JSON.parse(process.env.VAPI_ORGS)
    console.log(`✅ ${orgs.length} org(s) via VAPI_ORGS`)
  } catch (e) {
    console.error('❌ Erro ao parsear VAPI_ORGS:', e.message)
  }
} else {
  try {
    orgs = require('./orgs.config.js')
    console.log(`✅ ${orgs.length} org(s) via orgs.config.js`)
  } catch (e) {
    console.warn('⚠️  Crie orgs.config.js ou defina VAPI_ORGS')
  }
}

// ─── Helper de chamada à API VAPI ───────────────────────────────────────────
async function fetchVapi(endpoint, apiKey) {
  const res = await fetch(`https://api.vapi.ai${endpoint}`, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
  })
  if (!res.ok) throw new Error(`VAPI ${res.status}: ${res.statusText}`)
  return res.json()
}

// Busca silenciosa — retorna null em caso de erro (ex.: endpoint não disponível)
async function fetchVapiSafe(endpoint, apiKey) {
  try { return await fetchVapi(endpoint, apiKey) }
  catch { return null }
}

// ─── Extrai limites de chamadas do objeto de org/plano do VAPI ───────────────
function extractCallLimits(orgInfo) {
  if (!orgInfo) return { callLimit: null, remainingConcurrentCalls: null }

  // O VAPI pode devolver os limites em diferentes caminhos — tentamos todos
  const limit =
    orgInfo?.subscription?.concurrentCallLimit ??
    orgInfo?.subscriptionLimit ??
    orgInfo?.plan?.concurrentCallLimit ??
    orgInfo?.concurrentCallLimit ??
    null

  const remaining =
    orgInfo?.remainingConcurrentCalls ??
    orgInfo?.subscription?.remainingConcurrentCalls ??
    null

  return { callLimit: limit, remainingConcurrentCalls: remaining }
}

// ─── Endpoint principal ──────────────────────────────────────────────────────
app.get('/api/data', async (req, res) => {
  if (orgs.length === 0) {
    return res.json({
      timestamp: new Date().toISOString(),
      assistants: [], orgs: [],
      error: 'Nenhuma organização configurada.'
    })
  }

  const results = await Promise.allSettled(
    orgs.map(async (org) => {
      try {
        // Busca assistentes, chamadas e info da org em paralelo
        const [assistants, calls, orgInfo] = await Promise.all([
          fetchVapi('/assistant?limit=100', org.apiKey),
          fetchVapi('/call?limit=100', org.apiKey),
          fetchVapiSafe('/org', org.apiKey)   // limites de plano — falha silenciosa
        ])

        const assistantList = Array.isArray(assistants) ? assistants : []
        const callList      = Array.isArray(calls)      ? calls      : []

        // Chamadas em andamento
        const activeCalls        = callList.filter(c => c.status === 'in-progress')
        const activeAssistantIds = new Set(activeCalls.map(c => c.assistantId).filter(Boolean))

        // Última chamada CONCLUÍDA por assistente
        const lastCallByAssistant = {}
        for (const call of callList) {
          if (call.assistantId && call.status !== 'in-progress') {
            if (!lastCallByAssistant[call.assistantId]) {
              lastCallByAssistant[call.assistantId] = call
            }
          }
        }

        // Limites de chamadas concorrentes
        const { callLimit, remainingConcurrentCalls } = extractCallLimits(orgInfo)
        const currentConcurrent = activeCalls.length
        // Se não veio da API, estimamos o remaining pelo que vemos
        const remaining = remainingConcurrentCalls ?? (callLimit != null ? callLimit - currentConcurrent : null)

        return {
          orgName:  org.name,
          orgColor: org.color || null,
          activeCount:          currentConcurrent,
          callLimit:            callLimit,
          remainingConcurrentCalls: remaining,
          assistants: assistantList.map(a => ({
            id:       a.id,
            name:     a.name || 'Sem nome',
            orgName:  org.name,
            orgColor: org.color || null,
            isInCall: activeAssistantIds.has(a.id),
            currentCall: activeCalls.find(c => c.assistantId === a.id) || null,
            lastCall:    lastCallByAssistant[a.id] || null,
            createdAt:   a.createdAt,
            // Dados de limite repassados por agente (nível da org)
            orgActiveCount:  currentConcurrent,
            orgCallLimit:    callLimit,
            orgRemaining:    remaining,
          }))
        }
      } catch (err) {
        console.error(`❌ "${org.name}":`, err.message)
        return { orgName: org.name, error: err.message, assistants: [] }
      }
    })
  )

  const processed    = results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message, assistants: [] })
  const allAssistants = processed.flatMap(r => r.assistants || [])

  res.json({
    timestamp: new Date().toISOString(),
    orgs:      processed.map(({ assistants, ...org }) => org),
    assistants: allAssistants,
    stats: {
      total:     allAssistants.length,
      active:    allAssistants.filter(a => a.isInCall).length,
      orgsCount: orgs.length
    }
  })
})

// ─── Saúde ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', orgsLoaded: orgs.length, timestamp: new Date().toISOString() })
)

// ─── Produção: serve build do React ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))
  app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}  |  dev: http://localhost:5173`)
})
