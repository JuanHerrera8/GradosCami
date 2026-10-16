import type { CSSProperties } from 'react'
import type { TipoOrnamento } from '@/types/invitation'

/**
 * Ornamentos del kit. Regla de diseño: nunca tapan información.
 * - 'esquinas': fuera del área de texto, en las esquinas del bloque (asoman por el borde).
 * - 'arriba': ocupan su propio espacio sobre el título (no se superponen).
 * - 'detras': muy tenues detrás del texto (opacidad baja), sin interceptar toques.
 */

/** Trazo de una estrella de 5 puntas centrada en (x, y) */
function estrella(x: number, y: number, r: number): string {
  const puntos = Array.from({ length: 10 }).map((_, i) => {
    const radio = i % 2 === 0 ? r : r * 0.45
    const a = (Math.PI / 5) * i - Math.PI / 2
    return `${(x + Math.cos(a) * radio).toFixed(1)} ${(y + Math.sin(a) * radio).toFixed(1)}`
  })
  return `M${puntos.join(' L')} Z`
}

function Dibujo({ tipo, color }: { tipo: TipoOrnamento; color: string }) {
  const trazo = { fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (tipo) {
    case 'ramas':
      return (
        <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
          <path d="M4 66 C30 40 60 24 116 4" {...trazo} />
          {[
            [34, 46, -35],
            [56, 32, -30],
            [80, 20, -25],
            [22, 52, 30],
            [46, 36, 35],
            [70, 24, 30],
          ].map(([x, y, r], i) => (
            <ellipse key={i} cx={x} cy={y + (i > 2 ? 8 : 0)} rx="10" ry="4" transform={`rotate(${r} ${x} ${y + (i > 2 ? 8 : 0)})`} fill={color} />
          ))}
        </svg>
      )
    case 'filigrana':
      return (
        <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
          <path d="M6 64 L6 6 L64 6" {...trazo} />
          <path d="M14 64 L14 14 L64 14" {...trazo} strokeWidth={1.2} />
          <path d="M14 34 C26 34 34 26 34 14" {...trazo} />
          <circle cx="6" cy="6" r="4" fill={color} />
        </svg>
      )
    case 'confeti':
      return (
        <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
          <rect x="10" y="10" width="12" height="6" rx="2" fill={color} transform="rotate(30 16 13)" />
          <circle cx="44" cy="18" r="5" fill={color} opacity="0.7" />
          <rect x="70" y="8" width="12" height="6" rx="2" fill={color} transform="rotate(-25 76 11)" opacity="0.8" />
          <circle cx="98" cy="30" r="4" fill={color} />
          <path d="M20 46 q6 -8 12 0 t12 0" {...trazo} strokeWidth={3} />
          <rect x="60" y="44" width="10" height="10" fill={color} transform="rotate(20 65 49)" opacity="0.6" />
        </svg>
      )
    case 'nubes':
      return (
        <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
          <path d="M26 60 C12 60 6 50 9 42 C12 33 21 30 29 32 C32 18 46 10 60 13 C74 16 80 26 82 34 C94 30 108 37 110 48 C112 59 102 62 92 60 Z" fill={color} />
        </svg>
      )
    case 'palmas':
      return (
        <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
          <path d="M8 66 C40 50 70 30 112 8" {...trazo} strokeWidth={2.5} />
          {Array.from({ length: 9 }).map((_, i) => {
            const t = (i + 1) / 10
            const x = 8 + 104 * t
            const y = 66 - 58 * t
            return <path key={i} d={`M${x} ${y} q ${-10 + i} ${-18 + i} ${-22 + i * 1.5} ${-14}`} {...trazo} strokeWidth={2} />
          })}
        </svg>
      )
    case 'estrellas':
      return (
        <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
          {[
            [18, 22, 13, 1],
            [52, 12, 7, 0.7],
            [80, 34, 10, 0.85],
            [104, 14, 6, 0.6],
            [40, 50, 6, 0.6],
          ].map(([x, y, r, o], i) => (
            <path key={i} d={estrella(x, y, r)} fill={color} opacity={o} />
          ))}
        </svg>
      )
    case 'globos':
      return (
        <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
          {[
            [22, 22, 1],
            [46, 16, 0.75],
            [70, 24, 0.9],
          ].map(([x, y, o], i) => (
            <g key={i} opacity={o}>
              <ellipse cx={x} cy={y} rx="11" ry="13" fill={color} />
              <path d={`M${x} ${y + 13} q 4 10 -2 22`} {...trazo} strokeWidth={1.2} />
            </g>
          ))}
        </svg>
      )
    case 'corazones':
      return (
        <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
          {[
            [22, 22, 1, 1],
            [56, 14, 0.6, 0.7],
            [84, 30, 0.8, 0.85],
          ].map(([x, y, s, o], i) => (
            <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M0 10 C-14 1 -10 -12 0 -5 C10 -12 14 1 0 10 Z" fill={color} opacity={o} />
          ))}
        </svg>
      )
    case 'mariposas':
      return (
        <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
          {[
            [28, 28, 1, -15],
            [78, 20, 0.7, 20],
          ].map(([x, y, s, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill={color}>
              <ellipse cx="-9" cy="-6" rx="9" ry="11" opacity="0.85" />
              <ellipse cx="9" cy="-6" rx="9" ry="11" opacity="0.85" />
              <ellipse cx="-6" cy="9" rx="6" ry="7" opacity="0.65" />
              <ellipse cx="6" cy="9" rx="6" ry="7" opacity="0.65" />
              <rect x="-1.2" y="-12" width="2.4" height="24" rx="1.2" />
            </g>
          ))}
        </svg>
      )
    case 'hojas':
      return (
        <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
          <path d="M6 64 C34 50 60 34 104 10" {...trazo} />
          {[
            [26, 52, -40],
            [44, 42, 30],
            [62, 32, -35],
            [82, 22, 25],
          ].map(([x, y, r], i) => (
            <path key={i} transform={`translate(${x} ${y}) rotate(${r})`} d="M0 0 C6 -10 16 -10 22 0 C16 10 6 10 0 0 Z" fill={color} opacity={0.85} />
          ))}
        </svg>
      )
    case 'copos':
      return (
        <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
          {[
            [22, 24, 12],
            [62, 14, 7],
            [92, 36, 10],
          ].map(([x, y, r], i) => (
            <g key={i} {...trazo} strokeWidth={1.8} opacity={i === 1 ? 0.6 : 0.9}>
              {[0, 60, 120].map((a) => (
                <path key={a} transform={`rotate(${a} ${x} ${y})`} d={`M${x} ${y - r} V${y + r} M${x - 3} ${y - r + 4} L${x} ${y - r + 7} L${x + 3} ${y - r + 4} M${x - 3} ${y + r - 4} L${x} ${y + r - 7} L${x + 3} ${y + r - 4}`} />
              ))}
            </g>
          ))}
        </svg>
      )
    case 'lineas':
      return (
        <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
          <path d="M6 64 L6 6 L60 6" {...trazo} strokeWidth={1.4} />
        </svg>
      )
    default:
      return null
  }
}

export function OrnamentoEsquinas({ tipo, color }: { tipo: TipoOrnamento; color: string }) {
  if (tipo === 'ninguno') return null
  const base: CSSProperties = { position: 'absolute', width: 92, height: 54, pointerEvents: 'none', opacity: 0.6, zIndex: 0 }
  return (
    <>
      <span aria-hidden="true" style={{ ...base, top: -18, left: -22 }}>
        <Dibujo tipo={tipo} color={color} />
      </span>
      <span aria-hidden="true" style={{ ...base, bottom: -18, right: -22, transform: 'rotate(180deg)' }}>
        <Dibujo tipo={tipo} color={color} />
      </span>
    </>
  )
}

export function OrnamentoArriba({ tipo, color }: { tipo: TipoOrnamento; color: string }) {
  if (tipo === 'ninguno') return null
  return (
    <span aria-hidden="true" style={{ display: 'block', width: 84, height: 44, margin: '0 auto 4px', opacity: 0.75, pointerEvents: 'none' }}>
      <Dibujo tipo={tipo} color={color} />
    </span>
  )
}

export function OrnamentoDetras({ tipo, color }: { tipo: TipoOrnamento; color: string }) {
  if (tipo === 'ninguno') return null
  return (
    <span
      aria-hidden="true"
      style={{ position: 'absolute', inset: '10% 8%', opacity: 0.08, pointerEvents: 'none', zIndex: 0 }}
    >
      <Dibujo tipo={tipo} color={color} />
    </span>
  )
}

/** Muestra pequeña de un ornamento (para paneles del editor) */
export function MuestraOrnamento({ tipo, color }: { tipo: TipoOrnamento; color: string }) {
  return (
    <span aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }}>
      <Dibujo tipo={tipo} color={color} />
    </span>
  )
}
