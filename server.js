const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())

// Carrega configuração das organizações
// Prioridade: variável de ambiente VAPI_ORGS (para Render/produção) → orgs.config.js (para uso local)
let orgs = []

if (process.env.VAPI_ORGS) {
  try {
    orgs = JSON.parse(process.env.VAPI_ORGS)
    console.log(`✅ ${orgs.length} organização(ões) carregada(s) via variável de ambiente VAPI_ORGS`)
  } catch (e) {
    console.error('❌ Erro ao parsear VAPI_ORGS. Verifique se é um JSON válido.', e.message)
  }
} else {
  try {
    orgs = require('./orgs.config.js')
    console.log(`✅ ${orgs.length} organização(ões) carregada(s) via orgs.config.js`)
  } catch (e) {
    console.warn('⚠️  Nenhuma configuração encontrada. Defina a variável VAPI_ORGS ou crie orgs.config.js')
  }
}

// Função helper para chamar a API do VAPI
// Usa o fetch nativo do Node.js 18+ (sem dependências externas)
async function fetchVapi(endpoint, apiKey) {
  const url = `https://api.vapi.ai${endpoint}`

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`VAPI API error ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

// Endpoint principal: retorna todos os assistentes com status
app.get('/api/data', async (req, res) => {
  if (orgs.length === 0) {
    return res.json({
      timestamp: new Date().toISOString(),
      assistants: [],
      orgs: [],
      error: 'Nenhuma organização configurada. Verifique orgs.config.js'
    })
  }

  const results = await Promise.allSettled(
    orgs.map(async (org) => {
      try {
        // Busca assistentes e chamadas em paralelo
        const [assistants, calls] = await Promise.all([
          fetchVapi('/assistant?limit=100', org.apiKey),
          fetchVapi('/call?limit=100', org.apiKey)
        ])

        const assistantList = Array.isArray(assistants) ? assistants : []
        const callList = Array.isArray(calls) ? calls : []

        // Chamadas em andamento agora
        const activeCalls = callList.filter(c => c.status === 'in-progress')
        const activeAssistantIds = new Set(
          activeCalls.map(c => c.assistantId).filter(Boolean)
        )

        // Última chamada concluída por assistente
        const lastCallByAssistant = {}
        for (const call of callList) {
          if (call.assistantId && call.status !== 'in-progress') {
            if (!lastCallByAssistant[call.assistantId]) {
              lastCallByAssistant[call.assistantId] = call
            }
          }
        }

        // Métricas da organização
        const totalCallsToday = callList.filter(c => {
          const callDate = new Date(c.createdAt)
          const today = new Date()
          return callDate.toDateString() === today.toDateString()
        }).length

        return {
          orgName: org.name,
          orgColor: org.color || null,
          totalCallsToday,
          activeCount: activeCalls.length,
          assistants: assistantList.map(a => ({
            id: a.id,
            name: a.name || 'Sem nome',
            orgName: org.name,
            orgColor: org.color || null,
            isInCall: activeAssistantIds.has(a.id),
            currentCall: activeCalls.find(c => c.assistantId === a.id) || null,
            lastCall: lastCallByAssistant[a.id] || null,
            createdAt: a.createdAt
          }))
        }
      } catch (err) {
        console.error(`❌ Erro ao buscar dados de "${org.name}":`, err.message)
        return {
          orgName: org.name,
          error: err.message,
          assistants: []
        }
      }
    })
  )

  const processed = results.map(r =>
    r.status === 'fulfilled' ? r.value : { error: r.reason?.message, assistants: [] }
  )

  const allAssistants = processed.flatMap(r => r.assistants || [])

  res.json({
    timestamp: new Date().toISOString(),
    orgs: processed.map(({ assistants, ...org }) => org),
    assistants: allAssistants,
    stats: {
      total: allAssistants.length,
      active: allAssistants.filter(a => a.isInCall).length,
      orgsCount: orgs.length
    }
  })
})

// Endpoint de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', orgsLoaded: orgs.length, timestamp: new Date().toISOString() })
})

// Serve o build do React em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 VAPI Dashboard server rodando em http://localhost:${PORT}`)
  console.log(`   Em dev, acesse: http://localhost:5173`)
})
