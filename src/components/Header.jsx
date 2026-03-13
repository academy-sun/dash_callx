export function Header({
  stats, lastUpdate, isLoading, onRefresh,
  hiddenCount, showHidden, onToggleShowHidden, onRestoreAll
}) {
  const formatTime = (isoStr) => {
    if (!isoStr) return '--:--:--'
    return new Date(isoStr).toLocaleTimeString('pt-BR')
  }

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🤖</span>
          <div className="logo-text">
            <span className="logo-title">VAPI Dashboard</span>
            <span className="logo-sub">Monitor de Agentes</span>
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
        {/* Controles de agentes ocultos */}
        {hiddenCount > 0 ? (
          <div className="hidden-controls">
            <button
              className={`toggle-btn ${showHidden ? 'active' : ''}`}
              onClick={onToggleShowHidden}
              title={showHidden ? 'Esconder os ocultos' : 'Ver agentes ocultos'}
            >
              <span className="toggle-icon">👁</span>
              <span className="toggle-label">
                {showHidden ? 'Esconder' : `Ver ocultos`}
              </span>
              <span className="hidden-badge">{hiddenCount}</span>
            </button>
            <button
              className="restore-btn"
              onClick={onRestoreAll}
              title="Restaurar todos os agentes"
            >
              Restaurar todos
            </button>
          </div>
        ) : null}

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
