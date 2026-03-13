import { useEffect, useState } from 'react'

// Paletas realistas de pele
const SKINS = [
  { base: '#FDDCB2', shadow: '#E8B882', highlight: '#FFF0D5', cheek: '#F0A090', lip: '#C87068' },
  { base: '#F2C28A', shadow: '#D49A58', highlight: '#FFD8A0', cheek: '#E09070', lip: '#B86848' },
  { base: '#DFA070', shadow: '#B87840', highlight: '#EEB880', cheek: '#D08060', lip: '#A05838' },
  { base: '#C88050', shadow: '#9A5828', highlight: '#E09860', cheek: '#B87048', lip: '#885028' },
  { base: '#8D5524', shadow: '#6B3A10', highlight: '#A8692E', lip: '#7A3820', cheek: '#8A5030' },
  { base: '#FECFB0', shadow: '#E8A880', highlight: '#FFE8C8', cheek: '#F0A898', lip: '#CC7878' },
]

// Cores de cabelo com camadas de luz
const HAIRS = [
  { base: '#1C0A08', mid: '#2E1410', light: '#4A2218' },  // preto
  { base: '#2A1208', mid: '#4A2010', light: '#6E3018' },  // castanho escuro
  { base: '#5C2E10', mid: '#8A4E20', light: '#B87840' },  // castanho avermelhado
  { base: '#7A4010', mid: '#A85E20', light: '#D08040' },  // castanho médio
  { base: '#A06010', mid: '#C88030', light: '#E8A850' },  // loiro escuro
  { base: '#C8901A', mid: '#E0B030', light: '#F8D060' },  // loiro claro
  { base: '#1A1A2A', mid: '#2E2E42', light: '#484860' },  // preto frio
  { base: '#6B3010', mid: '#902010', light: '#C03018' },  // ruivo
]

const ORG_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f59e0b', '#10b981', '#3b82f6', '#ef4444',
  '#f97316', '#84cc16', '#06b6d4', '#a855f7'
]

// Estilos de cabelo (índice determina o caminho SVG gerado)
const HAIR_STYLES = ['long_straight', 'long_wavy', 'medium', 'short_wavy']

function hashStr(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) { h = str.charCodeAt(i) + ((h << 5) - h); h = h & h }
  return Math.abs(h)
}

export function Avatar({ name, orgName, isInCall, orgColor, size = 64 }) {
  const [mouthOpen, setMouthOpen] = useState(false)

  const hash   = hashStr(name + orgName)
  const skin   = SKINS[hash % SKINS.length]
  const hair   = HAIRS[(hash >> 3) % HAIRS.length]
  const accent = orgColor || ORG_COLORS[(hash >> 6) % ORG_COLORS.length]
  const style  = HAIR_STYLES[(hash >> 9) % HAIR_STYLES.length]
  // Determinar se é um avatar mais "feminino" ou "masculino" pela variação do hash
  const isFem  = (hash >> 2) % 2 === 0

  // Boca só anima quando em chamada
  useEffect(() => {
    if (!isInCall) { setMouthOpen(false); return }
    const pattern = [false, true, false, false, true, true, false, true]
    let step = 0
    const iv = setInterval(() => { step = (step + 1) % pattern.length; setMouthOpen(pattern[step]) }, 150)
    return () => clearInterval(iv)
  }, [isInCall])

  // Coordenadas — viewBox 0 0 100 115 para rosto oval com espaço para cabelo
  const VW = 100, VH = 115

  // Rosto oval: mais alto do que largo, queixo ligeiramente afinado
  const faceX = 50, faceY = 62
  const faceRX = 24, faceRY = 31   // oval pronunciado

  // Olhos — forma amendoada (almond)
  const eyeY   = faceY - 8
  const lEyeX  = faceX - 9.5
  const rEyeX  = faceX + 9.5
  const eyeW   = 9, eyeH = 5.5

  // Sobrancelhas
  const browY  = eyeY - 7.5
  const browW  = eyeW * 1.2

  // Nariz — apenas sombras, sem contorno
  const noseY  = faceY + 5

  // Boca
  const mouthY = faceY + 16
  const mouthW = isFem ? 8.5 : 9.5

  const uid = hash % 99999

  // Caminhos da boca (cupid's bow)
  const upperLipPath =
    `M ${faceX - mouthW} ${mouthY}
     C ${faceX - mouthW * 0.5} ${mouthY - 2.5},
       ${faceX - 1.5} ${mouthY - 1.2},
       ${faceX} ${mouthY - 0.8}
     C ${faceX + 1.5} ${mouthY - 1.2},
       ${faceX + mouthW * 0.5} ${mouthY - 2.5},
       ${faceX + mouthW} ${mouthY}`

  const lowerLipPath = mouthOpen
    ? `M ${faceX - mouthW * 0.88} ${mouthY}
       Q ${faceX} ${mouthY + 6}, ${faceX + mouthW * 0.88} ${mouthY}`
    : `M ${faceX - mouthW * 0.88} ${mouthY}
       Q ${faceX} ${mouthY + 3.5}, ${faceX + mouthW * 0.88} ${mouthY}`

  // Olho amendoado: path que define o contorno
  const eyePath = (ex) =>
    `M ${ex - eyeW} ${eyeY}
     C ${ex - eyeW * 0.5} ${eyeY - eyeH * 1.15},
       ${ex + eyeW * 0.3} ${eyeY - eyeH * 1.2},
       ${ex + eyeW} ${eyeY}
     C ${ex + eyeW * 0.3} ${eyeY + eyeH * 0.65},
       ${ex - eyeW * 0.4} ${eyeY + eyeH * 0.6},
       ${ex - eyeW} ${eyeY} Z`

  // Cabelo: caminho muda por estilo
  const hairBack = (s) => {
    switch(s) {
      case 'long_straight':
        return `M ${faceX - faceRX * 1.45} ${faceY + faceRY * 0.55}
                L ${faceX - faceRX * 1.6}  ${VH * 1.05}
                L ${faceX + faceRX * 1.6}  ${VH * 1.05}
                L ${faceX + faceRX * 1.45} ${faceY + faceRY * 0.55}
                Q ${faceX + faceRX * 1.5}  ${faceY - faceRY * 1.2}
                  ${faceX}                  ${faceY - faceRY * 1.35}
                Q ${faceX - faceRX * 1.5}  ${faceY - faceRY * 1.2}
                  ${faceX - faceRX * 1.45} ${faceY + faceRY * 0.55} Z`
      case 'long_wavy':
        return `M ${faceX - faceRX * 1.5} ${faceY + faceRY * 0.4}
                C ${faceX - faceRX * 2.2} ${faceY + faceRY * 1.2},
                  ${faceX - faceRX * 1.8} ${VH * 0.9},
                  ${faceX - faceRX * 1.5} ${VH * 1.05}
                L ${faceX + faceRX * 1.5} ${VH * 1.05}
                C ${faceX + faceRX * 1.8} ${VH * 0.9},
                  ${faceX + faceRX * 2.2} ${faceY + faceRY * 1.2},
                  ${faceX + faceRX * 1.5} ${faceY + faceRY * 0.4}
                Q ${faceX + faceRX * 1.5}  ${faceY - faceRY * 1.15}
                  ${faceX}                  ${faceY - faceRY * 1.3}
                Q ${faceX - faceRX * 1.5}  ${faceY - faceRY * 1.15}
                  ${faceX - faceRX * 1.5}  ${faceY + faceRY * 0.4} Z`
      case 'medium':
        return `M ${faceX - faceRX * 1.4} ${faceY + faceRY * 0.2}
                L ${faceX - faceRX * 1.5} ${faceY + faceRY * 0.9}
                Q ${faceX} ${faceY + faceRY * 1.2} ${faceX + faceRX * 1.5} ${faceY + faceRY * 0.9}
                L ${faceX + faceRX * 1.4} ${faceY + faceRY * 0.2}
                Q ${faceX + faceRX * 1.5}  ${faceY - faceRY * 1.1}
                  ${faceX}                  ${faceY - faceRY * 1.25}
                Q ${faceX - faceRX * 1.5}  ${faceY - faceRY * 1.1}
                  ${faceX - faceRX * 1.4}  ${faceY + faceRY * 0.2} Z`
      default: // short_wavy
        return `M ${faceX - faceRX * 1.35} ${faceY + faceRY * 0.0}
                C ${faceX - faceRX * 1.6} ${faceY + faceRY * 0.45},
                  ${faceX - faceRX * 1.4} ${faceY + faceRY * 0.7},
                  ${faceX - faceRX * 1.2} ${faceY + faceRY * 0.85}
                Q ${faceX} ${faceY + faceRY * 1.1} ${faceX + faceRX * 1.2} ${faceY + faceRY * 0.85}
                C ${faceX + faceRX * 1.4} ${faceY + faceRY * 0.7},
                  ${faceX + faceRX * 1.6} ${faceY + faceRY * 0.45},
                  ${faceX + faceRX * 1.35} ${faceY + faceRY * 0.0}
                Q ${faceX + faceRX * 1.5}  ${faceY - faceRY * 1.05}
                  ${faceX}                  ${faceY - faceRY * 1.2}
                Q ${faceX - faceRX * 1.5}  ${faceY - faceRY * 1.05}
                  ${faceX - faceRX * 1.35} ${faceY + faceRY * 0.0} Z`
    }
  }

  // Franja / topo do cabelo sobre o rosto
  const hairFront = (s) => {
    if (s === 'short_wavy') {
      return `M ${faceX - faceRX * 1.35} ${faceY - faceRY * 0.1}
              C ${faceX - faceRX * 1.1}  ${faceY - faceRY * 1.15},
                ${faceX + faceRX * 0.2}  ${faceY - faceRY * 0.88},
                ${faceX + faceRX * 0.6}  ${faceY - faceRY * 0.78}
              C ${faceX + faceRX * 1.0}  ${faceY - faceRY * 0.68},
                ${faceX + faceRX * 1.4}  ${faceY - faceRY * 1.0},
                ${faceX + faceRX * 1.35} ${faceY + faceRY * 0.0}
              Q ${faceX + faceRX * 1.5}  ${faceY - faceRY * 1.05}
                ${faceX}                  ${faceY - faceRY * 1.2}
              Q ${faceX - faceRX * 1.5}  ${faceY - faceRY * 1.05}
                ${faceX - faceRX * 1.35} ${faceY - faceRY * 0.1} Z`
    }
    return `M ${faceX - faceRX * 1.45} ${faceY - faceRY * 0.45}
            C ${faceX - faceRX * 1.2}  ${faceY - faceRY * 1.22},
              ${faceX - faceRX * 0.2}  ${faceY - faceRY * 0.95},
              ${faceX + faceRX * 0.3}  ${faceY - faceRY * 0.88}
            C ${faceX + faceRX * 0.9}  ${faceY - faceRY * 0.78},
              ${faceX + faceRX * 1.3}  ${faceY - faceRY * 1.15},
              ${faceX + faceRX * 1.45} ${faceY - faceRY * 0.45}
            Q ${faceX + faceRX * 1.5}  ${faceY - faceRY * 1.15}
              ${faceX}                  ${faceY - faceRY * 1.3}
            Q ${faceX - faceRX * 1.5}  ${faceY - faceRY * 1.15}
              ${faceX - faceRX * 1.45} ${faceY - faceRY * 0.45} Z`
  }

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
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
            animation: 'pulse-ring 1.8s ease-out infinite 0.65s', opacity: 0.45
          }} />
        </>
      )}

      <svg
        width={size} height={size}
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Gradiente da pele — luz de 3/4 vindo de cima-esquerda */}
          <radialGradient id={`skin-${uid}`} cx="35%" cy="28%" r="72%">
            <stop offset="0%"   stopColor={skin.highlight} />
            <stop offset="45%"  stopColor={skin.base} />
            <stop offset="100%" stopColor={skin.shadow} />
          </radialGradient>

          {/* Gradiente do cabelo */}
          <linearGradient id={`hair-${uid}`} x1="25%" y1="0%" x2="75%" y2="100%">
            <stop offset="0%"   stopColor={hair.light} />
            <stop offset="40%"  stopColor={hair.mid} />
            <stop offset="100%" stopColor={hair.base} />
          </linearGradient>

          {/* Reflexo no cabelo */}
          <linearGradient id={`hair-sheen-${uid}`} x1="20%" y1="5%" x2="55%" y2="50%">
            <stop offset="0%"   stopColor={hair.light} stopOpacity="0.55" />
            <stop offset="60%"  stopColor={hair.light} stopOpacity="0" />
          </linearGradient>

          {/* Gradiente da íris */}
          <radialGradient id={`iris-${uid}`} cx="38%" cy="32%" r="65%">
            <stop offset="0%"   stopColor={accent} stopOpacity="1" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.5" />
          </radialGradient>

          {/* Fundo circular */}
          <radialGradient id={`bg-${uid}`} cx="50%" cy="55%" r="60%">
            <stop offset="0%"   stopColor={accent} stopOpacity="0.18" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.05" />
          </radialGradient>

          {/* Sombra suave sob queixo */}
          <radialGradient id={`jaw-shadow-${uid}`} cx="50%" cy="80%" r="42%">
            <stop offset="0%"   stopColor={skin.shadow} stopOpacity="0.30" />
            <stop offset="100%" stopColor={skin.shadow} stopOpacity="0" />
          </radialGradient>

          {/* Clip do olho esquerdo */}
          <clipPath id={`leye-${uid}`}><path d={eyePath(lEyeX)} /></clipPath>
          {/* Clip do olho direito */}
          <clipPath id={`reye-${uid}`}><path d={eyePath(rEyeX)} /></clipPath>
          {/* Clip circular para a cena toda */}
          <clipPath id={`circle-${uid}`}>
            <circle cx={VW / 2} cy={VH / 2} r={VW * 0.462} />
          </clipPath>

          <filter id={`soft-${uid}`}>
            <feGaussianBlur stdDeviation="0.8" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id={`glow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Círculo de fundo */}
        <circle cx={VW/2} cy={VH/2} r={VW * 0.462}
          fill={`url(#bg-${uid})`}
        />
        <circle cx={VW/2} cy={VH/2} r={VW * 0.462}
          fill="none" stroke={accent}
          strokeWidth={isInCall ? 2.5 : 1.5}
          opacity={isInCall ? 0.75 : 0.3}
        />

        <g clipPath={`url(#circle-${uid})`}>

          {/* ── CABELO TRASEIRO ─────────────────────── */}
          <path d={hairBack(style)} fill={`url(#hair-${uid})`} />

          {/* ── PESCOÇO ─────────────────────────────── */}
          <rect
            x={faceX - 9} y={faceY + faceRY - 3}
            width={18} height={22}
            rx={4}
            fill={`url(#skin-${uid})`}
          />
          {/* sombra lateral do pescoço */}
          <rect
            x={faceX - 9} y={faceY + faceRY - 3}
            width={5} height={22} rx={3}
            fill={skin.shadow} opacity={0.22}
          />

          {/* ── OMBROS / ROUPA ───────────────────────── */}
          <ellipse
            cx={faceX} cy={VH * 1.02}
            rx={faceRX * 2.1} ry={VH * 0.22}
            fill={accent} opacity={0.88}
          />
          {/* detalhe da gola */}
          <ellipse
            cx={faceX} cy={VH * 0.99}
            rx={faceRX * 0.65} ry={VH * 0.065}
            fill={accent}
            style={{ filter: 'brightness(1.3)' }}
          />

          {/* ── ROSTO ───────────────────────────────── */}
          {/* Mandíbula/queixo levemente afunilado */}
          <ellipse
            cx={faceX} cy={faceY + faceRY * 0.35}
            rx={faceRX * 0.78} ry={faceRY * 0.72}
            fill={`url(#skin-${uid})`}
          />
          {/* Oval principal */}
          <ellipse
            cx={faceX} cy={faceY}
            rx={faceRX} ry={faceRY}
            fill={`url(#skin-${uid})`}
          />
          {/* Sombra do queixo */}
          <ellipse
            cx={faceX} cy={faceY}
            rx={faceRX} ry={faceRY}
            fill={`url(#jaw-shadow-${uid})`}
          />

          {/* Orelhas */}
          {[[-1, faceX - faceRX * 0.96], [1, faceX + faceRX * 0.96]].map(([side, ex]) => (
            <g key={side}>
              <ellipse cx={ex} cy={faceY + 2} rx={4.5} ry={7}
                fill={skin.base}
              />
              <ellipse cx={ex + side * 0.5} cy={faceY + 2} rx={2.2} ry={4}
                fill={skin.shadow} opacity={0.28}
              />
            </g>
          ))}

          {/* ── SOBRANCELHAS ───────────────────────── */}
          {[[lEyeX, -1], [rEyeX, 1]].map(([ex, side]) => (
            <path key={ex}
              d={`M ${ex - browW * 0.58} ${browY + 1.5}
                  C ${ex - browW * 0.1}  ${browY - 1.5},
                    ${ex + browW * 0.25} ${browY - 1.2},
                    ${ex + browW * 0.58} ${browY + 0.8}`}
              fill={hair.base}
              strokeWidth={0} opacity={0.9}
              style={{ filter: `url(#soft-${uid})` }}
            />
          ))}

          {/* ── OLHOS ──────────────────────────────── */}
          {[[lEyeX, `leye-${uid}`], [rEyeX, `reye-${uid}`]].map(([ex, clipId]) => (
            <g key={ex}>
              {/* Fundo branco do olho */}
              <path d={eyePath(ex)} fill="white" />
              {/* Íris */}
              <circle cx={ex + 0.5} cy={eyeY + 0.5} r={eyeH * 0.78}
                fill={`url(#iris-${uid})`}
                clipPath={`url(#${clipId})`}
              />
              {/* Pupila */}
              <circle cx={ex + 0.5} cy={eyeY + 0.6} r={eyeH * 0.44}
                fill="#0d0d12"
                clipPath={`url(#${clipId})`}
              />
              {/* Brilho principal */}
              <circle cx={ex - 1.8} cy={eyeY - 1.2} r={1.5}
                fill="white" opacity={0.88}
                clipPath={`url(#${clipId})`}
              />
              {/* Brilho secundário */}
              <circle cx={ex + 2.0} cy={eyeY + 0.5} r={0.75}
                fill="white" opacity={0.45}
                clipPath={`url(#${clipId})`}
              />
              {/* Linha superior da pálpebra (cílios) */}
              <path
                d={`M ${ex - eyeW} ${eyeY}
                    C ${ex - eyeW * 0.5} ${eyeY - eyeH * 1.15},
                      ${ex + eyeW * 0.3} ${eyeY - eyeH * 1.2},
                      ${ex + eyeW} ${eyeY}`}
                fill="none"
                stroke={hair.base}
                strokeWidth={1.6}
                strokeLinecap="round"
                opacity={0.92}
              />
              {/* Linha inferior da pálpebra */}
              <path
                d={`M ${ex - eyeW * 0.88} ${eyeY + 0.5}
                    C ${ex - eyeW * 0.3} ${eyeY + eyeH * 0.6},
                      ${ex + eyeW * 0.3} ${eyeY + eyeH * 0.6},
                      ${ex + eyeW * 0.88} ${eyeY + 0.5}`}
                fill="none"
                stroke={skin.shadow}
                strokeWidth={0.7}
                strokeLinecap="round"
                opacity={0.5}
              />
              {/* Canto interno do olho */}
              <circle cx={ex - eyeW + 1} cy={eyeY + 0.3} r={0.9}
                fill={skin.cheek || '#E8A080'} opacity={0.55}
              />
            </g>
          ))}

          {/* ── BOCHECHAS (blush) ──────────────────── */}
          <ellipse cx={lEyeX - 1} cy={faceY + 5} rx={7} ry={4.5}
            fill={skin.cheek || '#F09880'} opacity={0.22}
          />
          <ellipse cx={rEyeX + 1} cy={faceY + 5} rx={7} ry={4.5}
            fill={skin.cheek || '#F09880'} opacity={0.22}
          />

          {/* ── NARIZ — apenas sombras sutis ───────── */}
          <ellipse cx={faceX - 3.5} cy={noseY + 3} rx={3.5} ry={2.2}
            fill={skin.shadow} opacity={0.18}
          />
          <ellipse cx={faceX + 3.5} cy={noseY + 3} rx={3.5} ry={2.2}
            fill={skin.shadow} opacity={0.18}
          />
          {/* Bridge do nariz — linha muito sutil */}
          <line
            x1={faceX - 1.5} y1={noseY - 6}
            x2={faceX - 3.5} y2={noseY + 1}
            stroke={skin.shadow} strokeWidth={0.7}
            strokeLinecap="round" opacity={0.2}
          />

          {/* ── BOCA ────────────────────────────────── */}
          {/* Lábio superior — cupid's bow */}
          <path d={upperLipPath}
            fill={skin.lip}
            opacity={0.92}
          />
          {/* Abertura da boca */}
          {mouthOpen && isInCall && (
            <ellipse
              cx={faceX} cy={mouthY + 1.8}
              rx={mouthW * 0.75} ry={3.5}
              fill="#1a0808"
            />
          )}
          {/* Dentes quando aberto */}
          {mouthOpen && isInCall && (
            <ellipse
              cx={faceX} cy={mouthY + 0.8}
              rx={mouthW * 0.58} ry={1.8}
              fill="#f0ebe5"
            />
          )}
          {/* Lábio inferior */}
          <path d={lowerLipPath}
            fill={skin.lip}
            opacity={0.82}
          />
          {/* Brilho do lábio inferior */}
          <ellipse
            cx={faceX} cy={mouthY + (mouthOpen && isInCall ? 3.5 : 2.2)}
            rx={mouthW * 0.3} ry={1.0}
            fill="white" opacity={0.25}
          />

          {/* Philtrum (linhas entre nariz e boca) */}
          {[[-1.8, -0.8], [1.8, 0.8]].map(([x1, x2], i) => (
            <line key={i}
              x1={faceX + x1} y1={noseY + 4}
              x2={faceX + x2} y2={mouthY - 1.5}
              stroke={skin.shadow} strokeWidth={0.6}
              strokeLinecap="round" opacity={0.18}
            />
          ))}

          {/* ── CABELO FRONTAL ──────────────────────── */}
          <path d={hairFront(style)} fill={`url(#hair-${uid})`} />

          {/* ── REFLEXO NO CABELO ───────────────────── */}
          <path d={hairFront(style)} fill={`url(#hair-sheen-${uid})`} />

          {/* ── HEADSET quando em chamada ───────────── */}
          {isInCall && (
            <g>
              <path
                d={`M ${faceX - faceRX * 0.9} ${faceY - faceRY * 0.2}
                    A ${faceRX * 0.95} ${faceRY * 1.0} 0 0 1
                      ${faceX + faceRX * 0.9} ${faceY - faceRY * 0.2}`}
                fill="none" stroke={accent} strokeWidth={3}
                strokeLinecap="round" opacity={0.9}
              />
              {/* Peças auriculares */}
              <rect x={faceX - faceRX * 1.12} y={faceY - faceRY * 0.32}
                width={7} height={10} rx={2}
                fill={accent} opacity={0.9}
              />
              <rect x={faceX + faceRX * 0.88} y={faceY - faceRY * 0.32}
                width={7} height={10} rx={2}
                fill={accent} opacity={0.9}
              />
              {/* Microfone */}
              <line
                x1={faceX - faceRX * 0.78} y1={faceY - faceRY * 0.22 + 10}
                x2={faceX - faceRX * 0.9}  y2={faceY + faceRY * 0.3}
                stroke={accent} strokeWidth={2.2} strokeLinecap="round"
              />
              <circle cx={faceX - faceRX * 0.9} cy={faceY + faceRY * 0.33}
                r={2.8} fill={accent}
              />
            </g>
          )}

        </g>{/* fim clip circular */}

        {/* Ondas de som quando falando */}
        {isInCall && mouthOpen && (
          <g opacity={0.7}>
            <path
              d={`M ${VW * 0.54} ${VH * 0.42} Q ${VW * 0.62} ${VH * 0.5} ${VW * 0.54} ${VH * 0.58}`}
              fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round"
            />
            <path
              d={`M ${VW * 0.59} ${VH * 0.34} Q ${VW * 0.70} ${VH * 0.5} ${VW * 0.59} ${VH * 0.66}`}
              fill="none" stroke={accent} strokeWidth={1.5} strokeLinecap="round" opacity={0.55}
            />
          </g>
        )}
      </svg>
    </div>
  )
}
