export function Header({
  stats, lastUpdate, isLoading, onRefresh,
  hiddenCount, hideNoCalls, onToggleHideNoCalls
}) {
  const formatTime = (isoStr) => {
    if (!isoStr) return '--:--:--'
    return new Date(isoStr).toLocaleTimeString('pt-BR')
  }

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="logo">
          {/* Logo MX3 — estilo do site oficial */}
          <span className="logo-icon">⚡</span>
          <div className="logo-text">
            <span className="logo-title">
              <span className="logo-m">M</span><span className="logo-x3">X3</span>
              <span className="logo-dash"> Dashboard</span>
            </span>
            <span className="logo-sub">Monitor de Agentes IA</span>
          </div>
        </div>
      </div>

      <div className="header-stats">
        <div className="stat-pill active">
          <span className="stat-icon pulse-dot" />
          <span className="stat-value">{stats?.active ?? 0}</span>
          <span className="stat-label">Em Chamada</span>
        </div>
        <div className="stat-pill">
          <span className="stat-value">{stats?.total ?? 0}</span>
          <span className="stat-label">Agentes</span>
        </div>
        <div className="stat-pill">
          <span className="stat-value">{stats?.orgsCount ?? 0}</span>
          <span className="stat-label">Organizações</span>
        </div>
      </div>

      <div className="header-right">
        {/* Toggle: ocultar agentes sem histórico */}
        <button
          className={`toggle-btn ${hideNoCalls ? 'active' : ''}`}
          onClick={onToggleHideNoCalls}
          title={hideNoCalls
            ? `Exibir ${hiddenCount} agente(s) sem histórico`
            : 'Ocultar agentes sem nenhuma chamada registrada'}
        >
          <span className="toggle-icon">{hideNoCalls ? '👁' : '🙈'}</span>
          <span className="toggle-label">
            {hideNoCalls
              ? `Sem histórico (${hiddenCount})`
              : 'Sem histórico'}
          </span>
        </button>

        <div className="update-info">
          <span className="update-label">Atualizado às</span>
          <span className="update-time">{formatTime(lastUpdate)}</span>
        </div>
        <button
          className={`refresh-btn ${isLoading ? 'loading' : ''}`}
          onClick={onRefresh}
          disabled={isLoading}
          title="Atualizar agora"
        >
          <span className="refresh-icon">↻</span>
        </button>
      </div>
    </header>
  )
}
