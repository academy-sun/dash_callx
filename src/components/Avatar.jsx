import { useEffect, useState } from 'react'

const ORG_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f59e0b', '#10b981', '#3b82f6', '#ef4444',
  '#f97316', '#84cc16', '#06b6d4', '#a855f7'
]

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function Avatar({ name, orgName, isInCall, orgColor, size = 70 }) {
  const [mouthOpen, setMouthOpen] = useState(false)

  const hash = hashString(name + orgName)
  const accent = orgColor || ORG_COLORS[hash % ORG_COLORS.length]

  // Boca só anima quando em chamada — caso contrário totalmente estático
  useEffect(() => {
    if (!isInCall) {
      setMouthOpen(false)
      return
    }
    const pattern = [false, true, false, false, true, true, false, true, false, true]
    let step = 0
    const interval = setInterval(() => {
      step = (step + 1) % pattern.length
      setMouthOpen(pattern[step])
    }, 160)
    return () => clearInterval(interval)
  }, [isInCall])

  const W = size
  const H = size
  const cx = W / 2
  const cy = H / 2

  // Proporções do robô
  const headW  = W  * 0.72
  const headH  = H  * 0.58
  const headX  = cx - headW / 2
  const headY  = cy - headH * 0.38
  const headR  = W  * 0.08   // raio dos cantos

  // Antena
  const antennaX   = cx
  const antennaY1  = headY - H * 0.14
  const antennaY2  = headY - H * 0.01
  const antennaBallR = W * 0.055

  // Olhos
  const eyeY   = headY + headH * 0.28
  const eyeR   = headW * 0.12
  const eyeLX  = cx - headW * 0.22
  const eyeRX  = cx + headW * 0.22

  // Boca
  const mouthY  = headY + headH * 0.68
  const mouthW  = headW * 0.48
  const mouthH  = headH * 0.13

  // Pescoço
  const neckW  = headW * 0.28
  const neckH  = H    * 0.10
  const neckX  = cx - neckW / 2
  const neckY  = headY + headH - 1

  // Ombros / corpo
  const bodyW  = headW * 1.02
  const bodyH  = H * 0.20
  const bodyX  = cx - bodyW / 2
  const bodyY  = neckY + neckH

  const uid = hash % 99999

  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      {/* Anel pulsante quando em chamada */}
      {isInCall && (
        <>
          <div style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            border: `2px solid ${accent}`,
            animation: 'pulse-ring 1.8s ease-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: -16, borderRadius: '50%',
            border: `1.5px solid ${accent}`,
            animation: 'pulse-ring 1.8s ease-out infinite 0.6s',
            opacity: 0.5
          }} />
        </>
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <defs>
          {/* Gradiente do corpo do robô */}
          <linearGradient id={`body-grad-${uid}`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%"   stopColor="#3a4060" />
            <stop offset="100%" stopColor="#1e2235" />
          </linearGradient>

          {/* Gradiente do rosto */}
          <linearGradient id={`face-grad-${uid}`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%"   stopColor="#2a2f4a" />
            <stop offset="100%" stopColor="#181c2e" />
          </linearGradient>

          {/* Gradiente da tela/olho */}
          <radialGradient id={`eye-grad-${uid}`} cx="35%" cy="35%" r="60%">
            <stop offset="0%"   stopColor={accent} stopOpacity="1" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.4" />
          </radialGradient>

          {/* Brilho da antena */}
          <radialGradient id={`ball-grad-${uid}`} cx="35%" cy="30%" r="65%">
            <stop offset="0%"   stopColor={accent} />
            <stop offset="100%" stopColor={accent} stopOpacity="0.5" />
          </radialGradient>

          <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          <filter id={`inner-glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Círculo de fundo da organização */}
        <circle cx={cx} cy={cy} r={W * 0.46}
          fill={accent} opacity={isInCall ? 0.12 : 0.07}
        />
        <circle cx={cx} cy={cy} r={W * 0.46}
          fill="none" stroke={accent}
          strokeWidth={isInCall ? 2 : 1.5}
          opacity={isInCall ? 0.7 : 0.3}
        />

        {/* Pescoço */}
        <rect x={neckX} y={neckY} width={neckW} height={neckH + 2}
          fill={`url(#body-grad-${uid})`}
        />

        {/* Corpo / ombros */}
        <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH}
          rx={W * 0.05}
          fill={`url(#body-grad-${uid})`}
        />
        {/* Detalhe do peito */}
        <rect
          x={cx - bodyW * 0.22} y={bodyY + bodyH * 0.25}
          width={bodyW * 0.44} height={bodyH * 0.45}
          rx={W * 0.03}
          fill="none" stroke={accent} strokeWidth={1} opacity={0.5}
        />
        <circle cx={cx} cy={bodyY + bodyH * 0.47}
          r={W * 0.038}
          fill={accent} opacity={isInCall ? 0.9 : 0.35}
          filter={isInCall ? `url(#inner-glow-${uid})` : undefined}
        />

        {/* Antena */}
        <line
          x1={antennaX} y1={antennaY2}
          x2={antennaX} y2={antennaY1 + antennaBallR}
          stroke={accent} strokeWidth={W * 0.03} strokeLinecap="round"
          opacity={0.8}
        />
        <circle
          cx={antennaX} cy={antennaY1}
          r={antennaBallR}
          fill={`url(#ball-grad-${uid})`}
          filter={isInCall ? `url(#glow-${uid})` : undefined}
          opacity={isInCall ? 1 : 0.6}
        />

        {/* Cabeça */}
        <rect
          x={headX} y={headY} width={headW} height={headH}
          rx={headR}
          fill={`url(#face-grad-${uid})`}
          stroke={accent} strokeWidth={1.5}
          opacity={1}
          strokeOpacity={isInCall ? 0.7 : 0.3}
        />

        {/* Parafusos decorativos nos cantos */}
        {[
          [headX + W*0.045, headY + H*0.045],
          [headX + headW - W*0.045, headY + H*0.045],
          [headX + W*0.045, headY + headH - H*0.045],
          [headX + headW - W*0.045, headY + headH - H*0.045],
        ].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={W * 0.025}
            fill="none" stroke={accent} strokeWidth={0.8} opacity={0.35}
          />
        ))}

        {/* Olhos — telas LED */}
        {[eyeLX, eyeRX].map((ex, i) => (
          <g key={i}>
            {/* Fundo escuro do olho */}
            <circle cx={ex} cy={eyeY} r={eyeR * 1.15}
              fill="#0d0f1a"
            />
            {/* Iris LED */}
            <circle cx={ex} cy={eyeY} r={eyeR}
              fill={`url(#eye-grad-${uid})`}
              filter={isInCall ? `url(#inner-glow-${uid})` : undefined}
              opacity={isInCall ? 1 : 0.5}
            />
            {/* Pupila */}
            <circle cx={ex} cy={eyeY} r={eyeR * 0.42}
              fill="#0d0f1a"
            />
            {/* Brilho */}
            <circle cx={ex - eyeR * 0.3} cy={eyeY - eyeR * 0.28} r={eyeR * 0.2}
              fill="white" opacity={isInCall ? 0.8 : 0.35}
            />
          </g>
        ))}

        {/* Nariz — LED central pequeno */}
        <circle
          cx={cx} cy={headY + headH * 0.50}
          r={W * 0.028}
          fill={accent}
          opacity={isInCall ? 0.7 : 0.2}
        />

        {/* Boca — display LED */}
        <rect
          x={cx - mouthW / 2} y={mouthY - mouthH / 2}
          width={mouthW} height={mouthH}
          rx={W * 0.03}
          fill="#0d0f1a"
        />

        {/* Grade da boca (5 segmentos) */}
        {[0, 1, 2, 3, 4].map(i => {
          const segW = (mouthW - W * 0.015 * 6) / 5
          const segX = cx - mouthW / 2 + W * 0.015 + i * (segW + W * 0.015)
          const isActive = isInCall && (
            mouthOpen
              ? i % 2 === 0 || i === 2
              : i === 2
          )
          const segH = isActive
            ? mouthH * (i === 2 ? 0.75 : 0.60)
            : mouthH * 0.30
          const segY = mouthY - segH / 2

          return (
            <rect
              key={i}
              x={segX} y={segY}
              width={segW} height={segH}
              rx={W * 0.015}
              fill={accent}
              opacity={isActive ? (isInCall ? 0.95 : 0.3) : 0.2}
            />
          )
        })}

        {/* Linha decorativa superior da cabeça */}
        <line
          x1={headX + headR * 1.5} y1={headY + headH * 0.09}
          x2={headX + headW - headR * 1.5} y2={headY + headH * 0.09}
          stroke={accent} strokeWidth={0.8}
          opacity={0.25}
        />
      </svg>
    </div>
  )
}
