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
  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1)   return 'agora mesmo'
  if (diffMin < 60)  return `há ${diffMin}min`
  if (diffHour < 24) return `há ${diffHour}h${diffMin % 60 > 0 ? ` ${diffMin % 60}min` : ''}`
  if (diffDay === 1) return 'ontem'
  return `há ${diffDay} dias`
}

function formatCallDuration(call) {
  if (!call?.startedAt) return null
  const start = new Date(call.startedAt)
  const end = call.endedAt ? new Date(call.endedAt) : new Date()
  const seconds = Math.floor((end - start) / 1000)
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export function AssistantCard({ assistant }) {
  const { name, orgName, orgColor, isInCall, currentCall, lastCall } = assistant

  const lastCallDate = getLastCallDate(lastCall)
  const lastCallTime = formatRelativeTime(lastCallDate?.toISOString())
  const callDuration = isInCall ? formatCallDuration(currentCall) : null
  const overdue      = !isInCall && isOverdue(lastCall)

  return (
    <div
      className={['assistant-card', isInCall ? 'in-call' : '', overdue ? 'overdue' : ''].filter(Boolean).join(' ')}
      style={isInCall && orgColor ? { '--accent-color': orgColor } : {}}
    >
      {/* Badge de status */}
      <div className={`status-badge ${isInCall ? 'active' : 'idle'}`}>
        <span className="status-dot" />
        {isInCall ? 'Em Chamada' : 'Disponível'}
      </div>

      {/* Avatar */}
      <div className="avatar-container">
        <Avatar
          name={name}
          orgName={orgName}
          isInCall={isInCall}
          orgColor={orgColor}
          size={64}
        />
      </div>

      {/* Info */}
      <div className="card-info">
        <h3 className="assistant-name">{name}</h3>
        <span className="org-name">{orgName}</span>
      </div>

      {/* Footer */}
      <div className="card-footer">
        {isInCall ? (
          <div className="call-active-info">
            <span className="call-timer-icon">📞</span>
            <span className="call-timer">{callDuration || 'conectando...'}</span>
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
