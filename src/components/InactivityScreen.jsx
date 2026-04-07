import React from 'react'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

function formatTime(date) {
  if (!date) return 'Nunca'
  return new Date(date).toLocaleString('pt-BR')
}

function getInactivityDuration(lastCallDate) {
  if (!lastCallDate) return 'Sem registro'
  const diffMs = Date.now() - new Date(lastCallDate).getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`
  return `${diffHours}h`
}

export function InactivityScreen({ assistants }) {
  // Agrupar por organização
  const orgGroups = assistants.reduce((acc, assistant) => {
    if (!acc[assistant.orgName]) {
      acc[assistant.orgName] = {
        name: assistant.orgName,
        color: assistant.orgColor,
        assistants: [],
        lastOrgCall: null
      }
    }
    acc[assistant.orgName].assistants.push(assistant)
    
    const lastCallDate = assistant.lastCall ? new Date(assistant.lastCall.createdAt || assistant.lastCall.startedAt) : null
    if (lastCallDate) {
      if (!acc[assistant.orgName].lastOrgCall || lastCallDate > new Date(acc[assistant.orgName].lastOrgCall)) {
        acc[assistant.orgName].lastOrgCall = lastCallDate.toISOString()
      }
    }
    
    return acc
  }, {})

  const inactiveOrgs = Object.values(orgGroups).filter(org => {
    if (!org.lastOrgCall) return true // Nunca ligou
    const diff = Date.now() - new Date(org.lastOrgCall).getTime()
    return diff > ONE_DAY_MS
  }).sort((a, b) => {
    // Mais inativos primeiro (data mais antiga)
    const dateA = a.lastOrgCall ? new Date(a.lastOrgCall).getTime() : 0
    const dateB = b.lastOrgCall ? new Date(b.lastOrgCall).getTime() : 0
    return dateA - dateB
  })

  if (inactiveOrgs.length === 0) {
    return (
      <div className="empty-inactivity">
        <div className="empty-icon">🎉</div>
        <h2>Todas as organizações estão ativas!</h2>
        <p>Nenhuma organização está sem ligar há mais de 24 horas.</p>
      </div>
    )
  }

  return (
    <div className="inactivity-container">
      <div className="inactivity-header">
        <h2>Organizações Inativas (+24h)</h2>
        <p>Listagem de empresas que não registraram nenhuma chamada no último dia.</p>
      </div>
      
      <div className="inactivity-grid">
        {inactiveOrgs.map(org => (
          <div key={org.name} className="inactivity-org-card" style={{ borderLeftColor: org.color || 'var(--accent)' }}>
            <div className="org-main-info">
              <div className="org-name-wrap">
                <span className="org-dot" style={{ backgroundColor: org.color || 'var(--accent)' }} />
                <h3>{org.name}</h3>
              </div>
              <div className="inactivity-badge">
                Inativa há {getInactivityDuration(org.lastOrgCall)}
              </div>
            </div>
            
            <div className="org-details">
              <div className="detail-item">
                <span className="detail-label">Última chamada:</span>
                <span className="detail-value">{formatTime(org.lastOrgCall)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Agentes na org:</span>
                <span className="detail-value">{org.assistants.length}</span>
              </div>
            </div>

            <div className="org-assistants-list">
              <span className="assistant-list-label">Agentes:</span>
              <div className="assistant-tags">
                {org.assistants.map(a => (
                  <span key={a.id} className="assistant-tag">{a.name}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
