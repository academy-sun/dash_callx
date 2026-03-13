import { useState, useEffect } from 'react'
import { useVapiMonitor } from './hooks/useVapiMonitor'
import { AssistantCard } from './components/AssistantCard'
import { Header } from './components/Header'
import './index.css'

const STORAGE_KEY = 'vapi-hidden-agents'

function loadHidden() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')) }
  catch { return new Set() }
}

function saveHidden(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>Carregando agentes VAPI...</p>
    </div>
  )
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div className="error-screen">
      <span className="error-icon">⚠️</span>
      <h2>Erro ao conectar</h2>
      <p>{error}</p>
      <p className="error-hint">
        Verifique se o servidor está rodando e o <code>orgs.config.js</code> está configurado.
      </p>
      <button className="retry-btn" onClick={onRetry}>Tentar novamente</button>
    </div>
  )
}

function EmptyScreen() {
  return (
    <div className="error-screen">
      <span className="error-icon">🔧</span>
      <h2>Nenhum agente encontrado</h2>
      <p>Configure suas organizações no arquivo <code>orgs.config.js</code></p>
      <p className="error-hint">
        Copie <code>orgs.config.example.js</code> para <code>orgs.config.js</code> e adicione suas API keys.
      </p>
    </div>
  )
}

export default function App() {
  const { assistants, stats, isLoading, error, lastUpdate, refetch } = useVapiMonitor()
  const [hiddenIds, setHiddenIds] = useState(loadHidden)
  const [showHidden, setShowHidden] = useState(false)

  // Persistir no localStorage sempre que mudar
  useEffect(() => { saveHidden(hiddenIds) }, [hiddenIds])

  const hideAgent = (id) =>
    setHiddenIds(prev => new Set([...prev, id]))

  const restoreAgent = (id) =>
    setHiddenIds(prev => { const s = new Set(prev); s.delete(id); return s })

  const restoreAll = () => setHiddenIds(new Set())

  if (isLoading && !assistants.length) return <LoadingScreen />
  if (error && !assistants.length) return <ErrorScreen error={error} onRetry={refetch} />
  if (!assistants.length && !isLoading) return <EmptyScreen />

  const inCallCount = assistants.filter(a => a.isInCall).length

  // Separa visíveis dos ocultos
  const visibleAssistants = assistants.filter(a => !hiddenIds.has(a.id))
  const hiddenAssistants = assistants.filter(a => hiddenIds.has(a.id))

  return (
    <div className="app">
      <Header
        stats={{ ...stats, active: inCallCount }}
        lastUpdate={lastUpdate}
        isLoading={isLoading}
        onRefresh={refetch}
        hiddenCount={hiddenAssistants.length}
        showHidden={showHidden}
        onToggleShowHidden={() => setShowHidden(v => !v)}
        onRestoreAll={restoreAll}
      />

      {inCallCount > 0 && (
        <div className="active-banner">
          <span className="active-banner-dot" />
          <strong>{inCallCount} agente{inCallCount > 1 ? 's' : ''} em chamada agora</strong>
        </div>
      )}

      {/* Grid principal — agentes visíveis */}
      <main className="dashboard-grid">
        {visibleAssistants.map(assistant => (
          <AssistantCard
            key={`${assistant.orgName}-${assistant.id}`}
            assistant={assistant}
            onHide={() => hideAgent(assistant.id)}
          />
        ))}

        {/* Seção de ocultos — mostrada inline quando "Ver ocultos" está ativo */}
        {showHidden && hiddenAssistants.length > 0 && (
          <>
            {visibleAssistants.length > 0 && (
              <div className="hidden-divider">
                <span>— Agentes ocultos —</span>
              </div>
            )}
            {hiddenAssistants.map(assistant => (
              <AssistantCard
                key={`hidden-${assistant.orgName}-${assistant.id}`}
                assistant={assistant}
                isHidden
                onRestore={() => restoreAgent(assistant.id)}
              />
            ))}
          </>
        )}
      </main>

      <footer className="dashboard-footer">
        <span>Atualização automática a cada 15s</span>
        {isLoading && <span className="footer-loading">↻ atualizando...</span>}
      </footer>
    </div>
  )
}
