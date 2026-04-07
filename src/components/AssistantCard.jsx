import { Avatar } from './Avatar'

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000

function getLastCallDate(lastCall) {
  if (!lastCall) return null
  return new Date(lastCall.createdAt || lastCall.startedAt)
}

function isOverdue(lastCall) {
  const date = getLastCallDate(lastCall)
  if (!date) return true
  return (Date.now() - date.getTime()) > TWO_DAYS_MS
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return null
  const diffMs   = Date.now() - new Date(dateStr).getTime()
  const diffMin  = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay  = Math.floor(diffHour / 24)

  if (diffMin  < 1)   return 'agora mesmo'
  if (diffMin  < 60)  return `há ${diffMin}min`
  if (diffHour < 24)  return `há ${diffHour}h${diffMin % 60 > 0 ? ` ${diffMin % 60}min` : ''}`
  if (diffDay  === 1) return 'ontem'
  return `há ${diffDay} dias`
}

function formatCallDuration(call) {
  if (!call?.startedAt) return null
  const seconds = Math.floor((Date.now() - new Date(call.startedAt).getTime()) / 1000)
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

// ── Label e ícone por status de chamada ───────────────────────────────────────
function getCallStatusInfo(status) {
  switch (status) {
    case 'queued':     return { label: 'Na Fila',      icon: '⏳', timer: 'aguardando...' }
    case 'ringing':    return { label: 'Discando',     icon: '📱', timer: 'discando...'   }
    case 'forwarding': return { label: 'Transferindo', icon: '🔀', timer: 'transferindo...' }
    default:           return { label: 'Em Chamada',   icon: '📞', timer: null }
  }
}

// ── Medidor de chamadas concorrentes da organização ───────────────────────────
function CallLimitMeter({ active, limit, remaining }) {
  if (active == null) return null

  const hasLimit = limit != null && limit > 0
  const pct      = hasLimit ? Math.min((active / limit) * 100, 100) : null

  // Cor baseada na saturação (semântica: verde = ok, amarelo = atenção, vermelho = crítico)
  const color = !hasLimit
    ? 'var(--accent)'
    : pct >= 90 ? '#ef4444'
    : pct >= 60 ? '#f59e0b'
    : '#22c55e'

  const label = hasLimit
    ? `${active}/${limit}`
    : `${active} ativa${active !== 1 ? 's' : ''}`

  const title = hasLimit
    ? `${active} chamada(s) ativa(s) de ${limit} permitidas — ${remaining ?? limit - active} restante(s)`
    : `${active} chamada(s) ativa(s) na organização`

  return (
    <div className="call-limit-meter" title={title}>
      <div className="call-limit-bar-wrap">
        {hasLimit ? (
          <div className="call-limit-bar">
            <div
              className="call-limit-fill"
              style={{ width: `${pct}%`, background: color }}
            />
          </div>
        ) : (
          <div className="call-limit-dots">
            {Array.from({ length: Math.min(active, 8) }).map((_, i) => (
              <span key={i} className="call-limit-dot" style={{ background: color }} />
            ))}
          </div>
        )}
      </div>
      <span className="call-limit-label" style={{ color }}>
        {label}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export function AssistantCard({ assistant }) {
  const {
    name, orgName, orgColor,
    isInCall, currentCall, lastCall,
    orgActiveCount, orgCallLimit, orgRemaining
  } = assistant

  const callStatus   = currentCall?.status
  const statusInfo   = isInCall ? getCallStatusInfo(callStatus) : null

  const lastCallDate = getLastCallDate(lastCall)
  const lastCallTime = formatRelativeTime(lastCallDate?.toISOString())
  const callDuration = (isInCall && callStatus === 'in-progress') ? formatCallDuration(currentCall) : null
  const overdue      = !isInCall && isOverdue(lastCall)

  return (
    <div
      className={['assistant-card', isInCall ? 'in-call' : '', overdue ? 'overdue' : ''].filter(Boolean).join(' ')}
      style={{ '--accent-color': (isInCall && orgColor) ? orgColor : 'var(--accent)' }}
    >
      {/* Medidor de chamadas concorrentes — canto superior esquerdo */}
      <CallLimitMeter
        active={orgActiveCount}
        limit={orgCallLimit}
        remaining={orgRemaining}
      />

      {/* Badge de status — canto superior direito */}
      <div className={`status-badge ${isInCall ? 'active' : 'idle'}`}>
        <span className="status-dot" />
        {isInCall ? statusInfo.label : 'Disponível'}
      </div>

      {/* Avatar */}
      <div className="avatar-container">
        <Avatar
          name={name}
          orgName={orgName}
          isInCall={isInCall}
          orgColor={orgColor}
          size={95}
        />
      </div>

      {/* Info */}
      <div className="card-info">
        <h3 className="assistant-name">{name}</h3>
        <span className="org-name">{orgName}</span>
        
        {/* Estatísticas Diárias */}
        <div className="daily-stats">
          <div className="stat-item" title="Chamadas realizadas hoje">
            <span className="stat-icon-mini">📞</span>
            <span className="stat-value-mini">{assistant.dailyStats?.total || 0}</span>
          </div>
          <div className="stat-item" title="Chamadas atendidas hoje">
            <span className="stat-icon-mini">✅</span>
            <span className="stat-value-mini">{assistant.dailyStats?.answered || 0}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer">
        {isInCall ? (
          <div className="call-active-info">
            <span className="call-timer-icon">{statusInfo.icon}</span>
            <span className="call-timer">
              {callDuration || statusInfo.timer || 'conectando...'}
            </span>
          </div>
        ) : (
          <div className={`last-call-info ${overdue ? 'overdue-text' : ''}`}>
            <span className="last-call-label">
              {overdue ? '⚠ Última chamada' : 'Última chamada'}
            </span>
            <span className="last-call-time">
              {lastCallTime ?? 'Nenhuma registrada'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
