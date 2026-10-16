import type { CSSProperties } from 'react'
import type { ConfiguracionVisual, FuenteTipografica, TipoEsquinas, TipoOrnamento } from '@/types/invitation'
import { familiaFuente } from '@/lib/editor/estilos'
import { obtenerKit } from '@/lib/estudio/kits'

const FUENTES_CALIGRAFICAS: FuenteTipografica[] = ['greatvibes', 'alexbrush', 'parisienne', 'dancing', 'pacifico']

function luminancia(hex: string): number {
  const limpio = hex.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(limpio)) return 1
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(limpio.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Color de texto legible sobre un fondo dado */
export function textoSobre(fondo: string): string {
  return luminancia(fondo) < 0.45 ? '#FFFFFF' : '#16141A'
}

export interface TemaInvitacion {
  fondo: string
  tarjeta: string
  tinta: string
  acento: string
  detalle: string
  textoAcento: string
  oscuro: boolean
  familiaTitulo: string
  familiaCuerpo: string
  tituloCaligrafico: boolean
  /** Radio de tarjetas y de controles según las esquinas del kit */
  radioTarjeta: string
  radioControl: string
  ornamento: TipoOrnamento
  /** Variables CSS para la raíz de la invitación */
  variables: CSSProperties
}

const RADIOS: Record<TipoEsquinas, [string, string]> = {
  rectas: ['6px', '6px'],
  suaves: ['22px', '14px'],
  redondas: ['30px', '999px'],
}

/** Convierte la configuración visual (kit) en un tema listo para pintar */
export function temaDe(visual: ConfiguracionVisual): TemaInvitacion {
  const kit = obtenerKit(visual.kitId)
  const fondo = visual.colorFondo || '#F8FAFC'
  const tarjeta = visual.colorTarjeta || '#FFFFFF'
  const tinta = visual.colorTexto || '#0F172A'
  const acento = visual.colorPrimario || '#0F172A'
  const detalle = visual.colorSecundario || '#D4AF37'
  const esquinas = visual.esquinas || kit?.esquinas || 'suaves'
  const [radioTarjeta, radioControl] = RADIOS[esquinas]
  const familiaTitulo = familiaFuente(visual.fuenteTitulo) || "'Fraunces', serif"
  const familiaCuerpo = familiaFuente(visual.fuenteCuerpo) || "'DM Sans', sans-serif"
  const textoAcento = textoSobre(acento)

  return {
    fondo,
    tarjeta,
    tinta,
    acento,
    detalle,
    textoAcento,
    oscuro: luminancia(tarjeta) < 0.4,
    familiaTitulo,
    familiaCuerpo,
    tituloCaligrafico: FUENTES_CALIGRAFICAS.includes(visual.fuenteTitulo),
    radioTarjeta,
    radioControl,
    ornamento: visual.ornamento || kit?.ornamento || 'ninguno',
    variables: {
      ['--inv-fondo' as string]: fondo,
      ['--inv-tarjeta' as string]: tarjeta,
      ['--inv-tinta' as string]: tinta,
      ['--inv-tinta-suave' as string]: `color-mix(in srgb, ${tinta} 72%, ${tarjeta})`,
      ['--inv-acento' as string]: acento,
      ['--inv-texto-acento' as string]: textoAcento,
      ['--inv-detalle' as string]: detalle,
      ['--inv-suave' as string]: `color-mix(in srgb, ${acento} 9%, ${tarjeta})`,
      ['--inv-linea' as string]: `color-mix(in srgb, ${acento} 22%, ${tarjeta})`,
      ['--inv-radio' as string]: radioTarjeta,
      ['--inv-radio-control' as string]: radioControl,
      ['--inv-fuente-titulo' as string]: familiaTitulo,
      ['--inv-fuente-cuerpo' as string]: familiaCuerpo,
      backgroundColor: fondo,
      color: tinta,
      fontFamily: familiaCuerpo,
    },
  }
}
