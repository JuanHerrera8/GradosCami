import type { ElementoLienzo, EstiloTexto } from '@/types/invitation'

/**
 * Combinaciones de texto prediseñadas (como los "text combos" de Canva).
 * Cada línea se crea como un elemento de texto independiente, apilado y centrado.
 * `dy` es la separación vertical (en % del alto de la sección) respecto a la línea anterior.
 */
export interface LineaCombinacion {
  texto: string
  estilo: EstiloTexto
  dy: number
  ancho?: number
}

export interface CombinacionTexto {
  id: string
  nombre: string
  lineas: LineaCombinacion[]
}

export const ESTILOS_TEXTO_BASICOS: { id: string; nombre: string; texto: string; estilo: EstiloTexto }[] = [
  { id: 'titulo', nombre: 'Añadir un título', texto: 'Título', estilo: { tamano: 40, peso: 700, alineacion: 'centro' } },
  { id: 'subtitulo', nombre: 'Añadir un subtítulo', texto: 'Subtítulo', estilo: { tamano: 24, peso: 500, alineacion: 'centro' } },
  { id: 'cuerpo', nombre: 'Añadir texto', texto: 'Escribe aquí tu mensaje', estilo: { tamano: 15, alineacion: 'centro', interlineado: 1.5 } },
  { id: 'caligrafia', nombre: 'Texto caligráfico', texto: 'Con amor', estilo: { tamano: 44, fuente: 'greatvibes', alineacion: 'centro' } },
]

export const COMBINACIONES_TEXTO: CombinacionTexto[] = [
  {
    id: 'nos_casamos',
    nombre: '¡Nos casamos!',
    lineas: [
      { texto: '¡Nos casamos!', estilo: { fuente: 'greatvibes', tamano: 52, alineacion: 'centro' }, dy: 0 },
      { texto: 'SOFÍA & CARLOS', estilo: { fuente: 'cinzel', tamano: 20, interletrado: 0.25, alineacion: 'centro', peso: 600 }, dy: 22 },
    ],
  },
  {
    id: 'save_the_date',
    nombre: 'Save the date',
    lineas: [
      { texto: 'SAVE THE DATE', estilo: { fuente: 'montserrat', tamano: 13, interletrado: 0.4, alineacion: 'centro', peso: 600 }, dy: 0 },
      { texto: '14 · 02 · 2027', estilo: { fuente: 'playfair', tamano: 38, alineacion: 'centro' }, dy: 12 },
    ],
  },
  {
    id: 'mis_xv',
    nombre: 'Mis XV años',
    lineas: [
      { texto: 'Mis', estilo: { fuente: 'parisienne', tamano: 36, alineacion: 'centro' }, dy: 0 },
      { texto: 'XV', estilo: { fuente: 'cinzel', tamano: 72, alineacion: 'centro', peso: 700 }, dy: 12 },
      { texto: 'AÑOS', estilo: { fuente: 'montserrat', tamano: 14, interletrado: 0.5, alineacion: 'centro' }, dy: 26 },
    ],
  },
  {
    id: 'cumple',
    nombre: '¡Feliz cumpleaños!',
    lineas: [
      { texto: '¡Vamos a celebrar!', estilo: { fuente: 'dancing', tamano: 34, alineacion: 'centro' }, dy: 0 },
      { texto: 'MIS 30', estilo: { fuente: 'poppins', tamano: 54, alineacion: 'centro', peso: 700 }, dy: 16 },
    ],
  },
  {
    id: 'bautizo',
    nombre: 'Mi bautizo',
    lineas: [
      { texto: 'Mi Bautizo', estilo: { fuente: 'alexbrush', tamano: 50, alineacion: 'centro' }, dy: 0 },
      { texto: 'Te esperamos para celebrar', estilo: { fuente: 'lora', tamano: 15, alineacion: 'centro', cursiva: true }, dy: 20 },
    ],
  },
  {
    id: 'grado',
    nombre: 'Ceremonia de grado',
    lineas: [
      { texto: 'CLASE 2027', estilo: { fuente: 'cinzel', tamano: 16, interletrado: 0.35, alineacion: 'centro', peso: 600 }, dy: 0 },
      { texto: '¡Lo logré!', estilo: { fuente: 'playfair', tamano: 46, alineacion: 'centro', cursiva: true }, dy: 12 },
    ],
  },
  {
    id: 'baby_shower',
    nombre: 'Baby shower',
    lineas: [
      { texto: 'Baby Shower', estilo: { fuente: 'parisienne', tamano: 48, alineacion: 'centro' }, dy: 0 },
      { texto: 'ESTÁ EN CAMINO', estilo: { fuente: 'montserrat', tamano: 13, interletrado: 0.4, alineacion: 'centro' }, dy: 20 },
    ],
  },
  {
    id: 'frase',
    nombre: 'Frase con autor',
    lineas: [
      { texto: '“El amor no tiene edad, siempre está naciendo”', estilo: { fuente: 'cormorant', tamano: 22, alineacion: 'centro', cursiva: true, interlineado: 1.35 }, dy: 0, ancho: 84 },
      { texto: '— Blaise Pascal', estilo: { fuente: 'montserrat', tamano: 12, alineacion: 'centro', interletrado: 0.15 }, dy: 24 },
    ],
  },
]

/** Convierte una combinación en elementos de texto listos para insertar en una sección */
export function crearElementosDesdeCombinacion(
  combinacion: CombinacionTexto,
  generarId: () => string,
  zBase: number,
  yInicial = 28
): ElementoLienzo[] {
  let y = yInicial
  return combinacion.lineas.map((linea, i) => {
    y += linea.dy
    const ancho = linea.ancho ?? 86
    return {
      id: generarId(),
      tipo: 'texto',
      x: (100 - ancho) / 2,
      y,
      ancho,
      rotacion: 0,
      opacidad: 1,
      z: zBase + i,
      texto: linea.texto,
      estiloTexto: linea.estilo,
      animacion: 'deslizar_arriba',
    }
  })
}
