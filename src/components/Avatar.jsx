import { useEffect, useState } from 'react'

// Paletas realistas
const SKIN_TONES = [
  { base: '#FDDBB4', shadow: '#E8B98A', highlight: '#FFF0D6', lip: '#C47E6A' },
  { base: '#F0C08A', shadow: '#D49A60', highlight: '#FFDA9E', lip: '#B8704E' },
  { base: '#D4956A', shadow: '#B5703C', highlight: '#EDAC7A', lip: '#A05535' },
  { base: '#C07A45', shadow: '#9A5A22', highlight: '#D48F58', lip: '#8B4520' },
  { base: '#8D5524', shadow: '#6B3A10', highlight: '#A8692E', lip: '#6B3010' },
  { base: '#FECBA8', shadow: '#E8A87C', highlight: '#FFE0C0', lip: '#C87868' },
]

const HAIR_STYLES = [
  { color: '#1C0F0A', highlight: '#3A1F14' },  // preto
  { color: '#2C1810', highlight: '#4A2F1A' },  // castanho escuro
  { color: '#5C3317', highlight: '#8B5A2B' },  // castanho médio
  { color: '#8B6914', highlight: '#C49A28' },  // loiro escuro
  { color: '#C19A3A', highlight: '#E8C060' },  // loiro claro
  { color: '#1A1A2E', highlight: '#2D2D50' },  // preto azulado
  { color: '#4A0E0E', highlight: '#7A2020' },  // vermelho escuro
  { color: '#6B6B6B', highlight: '#989898' },  // grisalho
]

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

export function Avatar({ name, orgName, isInCall, orgColor, size = 130 }) {
  const [mouthState, setMouthState] = useState(0)
  const [eyesClosed, setEyesClosed] = useState(false)

  const hash = hashString(name + orgName)
  const skin = SKIN_TONES[hash % SKIN_TONES.length]
  const hair = HAIR_STYLES[(hash >> 3) % HAIR_STYLES.length]
  const accent = orgColor || ORG_COLORS[(hash >> 5) % ORG_COLORS.length]

  // Talking animation
  useEffect(() => {
    if (!isInCall) { setMouthState(0); return }
    const pattern = [0, 1, 2, 1, 0, 0, 2, 1, 0, 1, 2, 2, 1, 0]
    let step = 0
    const interval = setInterval(() => {
      step = (step + 1) % pattern.length
      setMouthState(pattern[step])
    }, 110)
    return () => clearInterval(interval)
  }, [isInCall])

  // Blink
  useEffect(() => {
    if (isInCall) return
    const scheduleBlink = () => setTimeout(() => {
      setEyesClosed(true)
      setTimeout(() => { setEyesClosed(false); scheduleBlink() }, 120)
    }, 2800 + Math.random() * 3200)
    const t = scheduleBlink()
    return () => clearTimeout(t)
  }, [isInCall])

  // Layout geometry — proporções realistas
  const W = size, H = size
  const cx = W / 2
  // Rosto oval, mais alto do que largo
  const faceW = W * 0.52
  const faceH = H * 0.62
  const faceCY = H * 0.50

  // Olhos
  const eyeY = faceCY - faceH * 0.08
  const eyeSpacing = faceW * 0.30
  const eyeW = faceW * 0.17
  const eyeH = eyesClosed ? faceH * 0.015 : faceH * 0.105

  // Sobrancelhas
  const browY = eyeY - faceH * 0.13
  const browW = eyeW * 1.5

  // Nariz — ponto de destaque sutil
  const noseY = faceCY + faceH * 0.08

  // Boca
  const mouthY = faceCY + faceH * 0.26
  const mouthW = faceW * 0.32
  const lipH = faceH * 0.035

  // Pescoço
  const neckW = faceW * 0.32
  const neckTop = faceCY + faceH * 0.46
  const neckBot = H * 0.97

  // IDs únicos
  const uid = hash % 99999

  const getMouthUpperPath = () =>
    `M ${cx - mouthW} ${mouthY}
     C ${cx - mouthW * 0.5} ${mouthY - lipH * 1.5},
       ${cx + mouthW * 0.5} ${mouthY - lipH * 1.5},
       ${cx + mouthW} ${mouthY}`

  const getMouthOpenDepth = () => {
    if (mouthState === 0) return lipH * 0.3
    if (mouthState === 1) return faceH * 0.055
    return faceH * 0.1
  }

  const mouthOpenD = getMouthOpenDepth()

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Glow ring quando em chamada */}
      {isInCall && (
        <>
          <div style={{
            position: 'absolute', inset: -10, borderRadius: '50%',
            border: `2px solid ${accent}`,
            animation: 'pulse-ring 2s ease-out infinite', opacity: 0.8
          }} />
          <div style={{
            position: 'absolute', inset: -22, borderRadius: '50%',
            border: `1.5px solid ${accent}`,
            animation: 'pulse-ring 2s ease-out infinite 0.7s', opacity: 0.45
          }} />
        </>
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <defs>
          {/* Skin gradient — iluminação de 3/4 */}
          <radialGradient id={`skin-${uid}`} cx="38%" cy="32%" r="68%">
            <stop offset="0%"   stopColor={skin.highlight} />
            <stop offset="55%"  stopColor={skin.base} />
            <stop offset="100%" stopColor={skin.shadow} />
          </radialGradient>

          {/* Sombra do rosto */}
          <radialGradient id={`face-shadow-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="100%" stopColor={skin.shadow} stopOpacity="0.35" />
          </radialGradient>

          {/* Gradiente do cabelo */}
          <linearGradient id={`hair-${uid}`} x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%"   stopColor={hair.highlight} />
            <stop offset="50%"  stopColor={hair.color} />
            <stop offset="100%" stopColor={hair.color} stopOpacity="0.85" />
          </linearGradient>

          {/* Glow do accent */}
          <filter id={`glow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Sombra suave */}
          <filter id={`soft-shadow-${uid}`}>
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={skin.shadow} floodOpacity="0.4"/>
          </filter>

          {/* Clip do rosto */}
          <clipPath id={`face-clip-${uid}`}>
            <ellipse cx={cx} cy={faceCY} rx={faceW} ry={faceH} />
          </clipPath>

          {/* Clip circular externo */}
          <clipPath id={`circle-clip-${uid}`}>
            <circle cx={cx} cy={H / 2} r={W * 0.46} />
          </clipPath>
        </defs>

        {/* Círculo de fundo da org */}
        <circle cx={cx} cy={H / 2} r={W * 0.46}
          fill={accent} opacity={isInCall ? 0.18 : 0.10}
          filter={isInCall ? `url(#glow-${uid})` : undefined}
        />
        <circle cx={cx} cy={H / 2} r={W * 0.46}
          fill="none" stroke={accent} strokeWidth={isInCall ? 2.5 : 1.5}
          opacity={isInCall ? 0.8 : 0.35}
        />

        <g clipPath={`url(#circle-clip-${uid})`}>

          {/* Cabelo traseiro */}
          <ellipse
            cx={cx} cy={faceCY - faceH * 0.55}
            rx={faceW * 1.02} ry={faceH * 0.72}
            fill={`url(#hair-${uid})`}
          />

          {/* Pescoço */}
          <rect
            x={cx - neckW / 2} y={neckTop}
            width={neckW} height={neckBot - neckTop}
            rx={neckW * 0.15}
            fill={`url(#skin-${uid})`}
          />

          {/* Sombra lateral do pescoço */}
          <rect
            x={cx - neckW / 2} y={neckTop}
            width={neckW * 0.25} height={neckBot - neckTop}
            rx={neckW * 0.15}
            fill={skin.shadow} opacity={0.25}
          />

          {/* Ombros / roupa */}
          <ellipse
            cx={cx} cy={H * 1.0}
            rx={W * 0.55} ry={H * 0.22}
            fill={accent} opacity={0.9}
          />
          {/* Gola / detalhe */}
          <ellipse
            cx={cx} cy={H * 0.97}
            rx={W * 0.18} ry={H * 0.06}
            fill={accent}
            style={{ filter: 'brightness(1.25)' }}
          />

          {/* Rosto — base skin */}
          <ellipse cx={cx} cy={faceCY} rx={faceW} ry={faceH}
            fill={`url(#skin-${uid})`}
          />

          {/* Vinheta de profundidade no rosto */}
          <ellipse cx={cx} cy={faceCY} rx={faceW} ry={faceH}
            fill={`url(#face-shadow-${uid})`}
          />

          {/* Orelhas */}
          <ellipse cx={cx - faceW * 0.95} cy={faceCY + faceH * 0.02}
            rx={faceW * 0.14} ry={faceH * 0.17}
            fill={skin.base}
          />
          <ellipse cx={cx + faceW * 0.95} cy={faceCY + faceH * 0.02}
            rx={faceW * 0.14} ry={faceH * 0.17}
            fill={skin.base}
          />
          {/* Interior das orelhas */}
          <ellipse cx={cx - faceW * 0.97} cy={faceCY + faceH * 0.02}
            rx={faceW * 0.07} ry={faceH * 0.09}
            fill={skin.shadow} opacity={0.4}
          />
          <ellipse cx={cx + faceW * 0.97} cy={faceCY + faceH * 0.02}
            rx={faceW * 0.07} ry={faceH * 0.09}
            fill={skin.shadow} opacity={0.4}
          />

          {/* Sobrancelhas — forma realista */}
          {[-1, 1].map(side => (
            <g key={side}>
              <path
                d={`M ${cx + side * (eyeSpacing - browW * 0.6)} ${browY + faceH * 0.025}
                    C ${cx + side * (eyeSpacing - browW * 0.1)} ${browY - faceH * 0.02},
                      ${cx + side * (eyeSpacing + browW * 0.2)} ${browY - faceH * 0.015},
                      ${cx + side * (eyeSpacing + browW * 0.55)} ${browY + faceH * 0.025}`}
                fill={hair.color}
                opacity={0.92}
              />
            </g>
          ))}

          {/* Olhos */}
          {[-1, 1].map(side => {
            const ex = cx + side * eyeSpacing
            return (
              <g key={side}>
                {/* Sombra do olho */}
                <ellipse cx={ex} cy={eyeY + eyeH * 0.1}
                  rx={eyeW * 1.15} ry={eyeH * 0.8}
                  fill={skin.shadow} opacity={0.18}
                />
                {/* Branco do olho */}
                <ellipse cx={ex} cy={eyeY}
                  rx={eyeW} ry={eyeH}
                  fill={eyesClosed ? skin.base : 'white'}
                />
                {!eyesClosed && (
                  <>
                    {/* Iris */}
                    <ellipse cx={ex} cy={eyeY + eyeH * 0.12}
                      rx={eyeW * 0.72} ry={eyeH * 0.82}
                      fill={accent} opacity={0.85}
                    />
                    {/* Pupila */}
                    <ellipse cx={ex} cy={eyeY + eyeH * 0.18}
                      rx={eyeW * 0.38} ry={eyeH * 0.52}
                      fill="#0d0d0d"
                    />
                    {/* Brilho principal */}
                    <ellipse cx={ex - eyeW * 0.22} cy={eyeY - eyeH * 0.12}
                      rx={eyeW * 0.18} ry={eyeH * 0.22}
                      fill="white" opacity={0.85}
                    />
                    {/* Brilho secundário */}
                    <circle cx={ex + eyeW * 0.18} cy={eyeY + eyeH * 0.1}
                      r={eyeW * 0.10}
                      fill="white" opacity={0.4}
                    />
                  </>
                )}
                {/* Pálpebra superior */}
                <path
                  d={`M ${ex - eyeW} ${eyeY}
                      C ${ex - eyeW * 0.5} ${eyeY - eyeH * (eyesClosed ? 0.3 : 1.05)},
                        ${ex + eyeW * 0.5} ${eyeY - eyeH * (eyesClosed ? 0.3 : 1.05)},
                        ${ex + eyeW} ${eyeY}`}
                  fill={skin.base} stroke="none"
                  style={{ opacity: eyesClosed ? 1 : 0 }}
                />
                {/* Linha da pálpebra */}
                <path
                  d={`M ${ex - eyeW * 1.05} ${eyeY + eyeH * 0.05}
                      C ${ex - eyeW * 0.5} ${eyeY - eyeH * 0.95},
                        ${ex + eyeW * 0.5} ${eyeY - eyeH * 0.95},
                        ${ex + eyeW * 1.05} ${eyeY + eyeH * 0.05}`}
                  fill="none"
                  stroke={skin.shadow}
                  strokeWidth={eyeH * (eyesClosed ? 0.6 : 0.35)}
                  strokeLinecap="round"
                  opacity={0.7}
                />
              </g>
            )
          })}

          {/* Nariz — sombras sutis, sem desenho explícito */}
          <ellipse cx={cx - faceW * 0.08} cy={noseY + faceH * 0.08}
            rx={faceW * 0.07} ry={faceH * 0.04}
            fill={skin.shadow} opacity={0.22}
          />
          <ellipse cx={cx + faceW * 0.08} cy={noseY + faceH * 0.08}
            rx={faceW * 0.07} ry={faceH * 0.04}
            fill={skin.shadow} opacity={0.22}
          />
          {/* Ponte do nariz */}
          <path
            d={`M ${cx - faceW * 0.04} ${noseY - faceH * 0.18}
                Q ${cx - faceW * 0.06} ${noseY} ${cx - faceW * 0.09} ${noseY + faceH * 0.06}`}
            fill="none" stroke={skin.shadow} strokeWidth={faceW * 0.03}
            strokeLinecap="round" opacity={0.3}
          />

          {/* Lábio superior */}
          <path
            d={`M ${cx - mouthW} ${mouthY}
                C ${cx - mouthW * 0.55} ${mouthY - lipH * 1.8},
                  ${cx - mouthW * 0.08} ${mouthY - lipH * 0.8},
                  ${cx} ${mouthY - lipH * 0.5}
                C ${cx + mouthW * 0.08} ${mouthY - lipH * 0.8},
                  ${cx + mouthW * 0.55} ${mouthY - lipH * 1.8},
                  ${cx + mouthW} ${mouthY}`}
            fill={skin.lip}
            opacity={0.9}
          />

          {/* Área da boca aberta (quando falando) */}
          {mouthOpenD > lipH && (
            <ellipse
              cx={cx} cy={mouthY + mouthOpenD * 0.35}
              rx={mouthW * 0.85} ry={mouthOpenD * 0.75}
              fill="#1a0808"
            />
          )}
          {/* Dentes quando bem aberto */}
          {mouthState === 2 && (
            <ellipse
              cx={cx} cy={mouthY + mouthOpenD * 0.18}
              rx={mouthW * 0.62} ry={mouthOpenD * 0.28}
              fill="#f5f0eb"
              clipPath={`url(#face-clip-${uid})`}
            />
          )}

          {/* Lábio inferior */}
          <path
            d={`M ${cx - mouthW * 0.82} ${mouthY + mouthOpenD * 0.1}
                Q ${cx} ${mouthY + mouthOpenD + lipH * 1.5},
                  ${cx + mouthW * 0.82} ${mouthY + mouthOpenD * 0.1}`}
            fill={skin.lip}
            opacity={0.85}
          />
          {/* Brilho do lábio inferior */}
          <ellipse
            cx={cx} cy={mouthY + mouthOpenD * 0.25 + lipH}
            rx={mouthW * 0.25} ry={lipH * 0.45}
            fill="white" opacity={0.3}
          />

          {/* Sulco nasolabial / philtrum */}
          <path
            d={`M ${cx - faceW * 0.04} ${noseY + faceH * 0.1}
                L ${cx - faceW * 0.025} ${mouthY - lipH}`}
            fill="none" stroke={skin.shadow}
            strokeWidth={faceW * 0.025} strokeLinecap="round" opacity={0.2}
          />
          <path
            d={`M ${cx + faceW * 0.04} ${noseY + faceH * 0.1}
                L ${cx + faceW * 0.025} ${mouthY - lipH}`}
            fill="none" stroke={skin.shadow}
            strokeWidth={faceW * 0.025} strokeLinecap="round" opacity={0.2}
          />

          {/* Cabelo frontal sobre o rosto */}
          <path
            d={`M ${cx - faceW * 0.98} ${faceCY - faceH * 0.48}
                C ${cx - faceW * 0.7}  ${faceCY - faceH * 1.2},
                  ${cx + faceW * 0.7}  ${faceCY - faceH * 1.2},
                  ${cx + faceW * 0.98} ${faceCY - faceH * 0.48}
                C ${cx + faceW * 0.6}  ${faceCY - faceH * 0.7},
                  ${cx + faceW * 0.2}  ${faceCY - faceH * 0.52},
                  ${cx}                ${faceCY - faceH * 0.46}
                C ${cx - faceW * 0.2}  ${faceCY - faceH * 0.52},
                  ${cx - faceW * 0.6}  ${faceCY - faceH * 0.7},
                  ${cx - faceW * 0.98} ${faceCY - faceH * 0.48}Z`}
            fill={`url(#hair-${uid})`}
          />

          {/* Reflexo/brilho do cabelo */}
          <path
            d={`M ${cx - faceW * 0.3} ${faceCY - faceH * 0.88}
                Q ${cx} ${faceCY - faceH * 1.05},
                  ${cx + faceW * 0.15} ${faceCY - faceH * 0.78}`}
            fill="none" stroke={hair.highlight}
            strokeWidth={faceW * 0.06} strokeLinecap="round" opacity={0.35}
          />

          {/* Headset quando em chamada */}
          {isInCall && (
            <g>
              {/* Arco do headset */}
              <path
                d={`M ${cx - faceW * 0.82} ${faceCY - faceH * 0.15}
                    A ${faceW * 0.84} ${faceH * 0.92} 0 0 1
                      ${cx + faceW * 0.82} ${faceCY - faceH * 0.15}`}
                fill="none" stroke={accent}
                strokeWidth={faceW * 0.1} strokeLinecap="round"
                opacity={0.9}
              />
              {/* Peças auriculares */}
              <rect
                x={cx - faceW * 0.97} y={faceCY - faceH * 0.24}
                width={faceW * 0.22} height={faceH * 0.28}
                rx={faceW * 0.05}
                fill={accent}
              />
              <rect
                x={cx + faceW * 0.75} y={faceCY - faceH * 0.24}
                width={faceW * 0.22} height={faceH * 0.28}
                rx={faceW * 0.05}
                fill={accent}
              />
              {/* Microfone */}
              <line
                x1={cx - faceW * 0.86} y1={faceCY + faceH * 0.05}
                x2={cx - faceW * 0.94} y2={faceCY + faceH * 0.34}
                stroke={accent} strokeWidth={faceW * 0.07} strokeLinecap="round"
              />
              <circle
                cx={cx - faceW * 0.94} cy={faceCY + faceH * 0.38}
                r={faceW * 0.07} fill={accent}
              />
            </g>
          )}

        </g>{/* fim clipPath circular */}

        {/* Ondas de áudio quando falando */}
        {isInCall && mouthState > 0 && (
          <g opacity={mouthState === 2 ? 0.85 : 0.45}>
            <path
              d={`M ${cx + W * 0.54} ${H * 0.38} Q ${cx + W * 0.62} ${H * 0.5} ${cx + W * 0.54} ${H * 0.62}`}
              fill="none" stroke={accent} strokeWidth={2}
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + W * 0.60} ${H * 0.30} Q ${cx + W * 0.72} ${H * 0.5} ${cx + W * 0.60} ${H * 0.70}`}
              fill="none" stroke={accent} strokeWidth={1.5}
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  )
}
