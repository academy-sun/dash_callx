import { useState } from 'react'
import { useVapiMonitor } from './hooks/useVapiMonitor'
import { AssistantCard } from './components/AssistantCard'
import { Header } from './components/Header'
import './index.css'

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

  // Controla se agentes sem nenhuma chamada ficam ocultos
  const [hideNoCalls, setHideNoCalls] = useState(true)

  if (isLoading && !assistants.length) return <LoadingScreen />
  if (error && !assistants.length) return <ErrorScreen error={error} onRetry={refetch} />
  if (!assistants.length && !isLoading) return <EmptyScreen />

  const inCallCount = assistants.filter(a => a.isInCall).length

  // Agentes sem nenhuma chamada registrada
  // Usa APENAS lastCall (nunca isInCall) — evita flickering a cada poll
  const hasNoHistory = (a) => !a.lastCall

  const visibleAssistants = hideNoCalls
    ? assistants.filter(a => !hasNoHistory(a))
    : assistants

  const hiddenCount = assistants.filter(hasNoHistory).length

  return (
    <div className="app">
      <Header
        stats={{ ...stats, active: inCallCount }}
        lastUpdate={lastUpdate}
        isLoading={isLoading}
        onRefresh={refetch}
        hiddenCount={hiddenCount}
        hideNoCalls={hideNoCalls}
        onToggleHideNoCalls={() => setHideNoCalls(v => !v)}
      />

      {inCallCount > 0 && (
        <div className="active-banner">
          <span className="active-banner-dot" />
          <strong>{inCallCount} agente{inCallCount > 1 ? 's' : ''} em chamada agora</strong>
        </div>
      )}

      <main className="dashboard-grid">
        {visibleAssistants.map(assistant => (
          <AssistantCard
            key={`${assistant.orgName}-${assistant.id}`}
            assistant={assistant}
          />
        ))}
      </main>

      <footer className="dashboard-footer">
        <span>Atualização automática a cada 15s</span>
        {hideNoCalls && hiddenCount > 0 && (
          <span className="footer-hidden-info">
            {hiddenCount} sem histórico oculto{hiddenCount > 1 ? 's' : ''}
          </span>
        )}
        {isLoading && <span className="footer-loading">↻ atualizando...</span>}
      </footer>
    </div>
  )
}
