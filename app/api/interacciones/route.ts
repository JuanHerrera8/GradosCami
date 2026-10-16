import { NextRequest, NextResponse } from 'next/server'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { ServidorAlmacen } from '@/lib/server-storage'
import type { SeccionModular, TipoSeccion } from '@/types/invitation'

export const dynamic = 'force-dynamic'

/** Acciones que un invitado puede hacer sobre la invitación, y el bloque al que aplican */
const ACCIONES: Record<string, TipoSeccion> = {
  agregar_cancion: 'playlist',
  reservar_regalo: 'lista_regalos',
  liberar_regalo: 'lista_regalos',
  votar: 'juego_adivinar',
}

const texto = (valor: unknown, maximo: number) => String(valor ?? '').replace(/\s+/g, ' ').trim().slice(0, maximo)

function aplicarAccion(seccion: SeccionModular, accion: string, datos: Record<string, unknown>): SeccionModular | string {
  const d = { ...(seccion.datos || {}) }
  switch (accion) {
    case 'agregar_cancion': {
      const titulo = texto(datos.titulo, 80)
      if (!titulo) return 'Escribe el nombre de la canción.'
      const canciones = [...(d.canciones || [])]
      if (canciones.length >= 300) return 'La playlist ya está llena.'
      canciones.push({
        id: `cn-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        titulo,
        artista: texto(datos.artista, 60) || undefined,
        propuestaPor: texto(datos.propuestaPor, 60) || undefined,
      })
      d.canciones = canciones
      break
    }
    case 'reservar_regalo': {
      const nombre = texto(datos.nombre, 60)
      if (!nombre) return 'Escribe tu nombre para reservar.'
      const regalos = d.regalos || []
      const regalo = regalos.find((r) => r.id === datos.regaloId)
      if (!regalo) return 'Ese regalo ya no está en la lista.'
      if (regalo.reservadoPor) return 'Alguien acaba de reservar ese regalo.'
      d.regalos = regalos.map((r) => (r.id === regalo.id ? { ...r, reservadoPor: nombre } : r))
      break
    }
    case 'liberar_regalo': {
      const regalos = d.regalos || []
      d.regalos = regalos.map((r) => (r.id === datos.regaloId ? { ...r, reservadoPor: undefined } : r))
      break
    }
    case 'votar': {
      const opciones = d.opcionesJuego || []
      if (!opciones.some((o) => o.id === datos.opcionId)) return 'Esa opción no existe.'
      d.opcionesJuego = opciones.map((o) => (o.id === datos.opcionId ? { ...o, votos: (o.votos || 0) + 1 } : o))
      break
    }
    default:
      return 'Acción no válida.'
  }
  return { ...seccion, datos: d }
}

/**
 * POST /api/interacciones
 * Guarda en la base de datos lo que hacen los invitados dentro de la invitación:
 * proponer canciones, reservar regalos y votar en juegos.
 */
export async function POST(req: NextRequest) {
  try {
    const { slug, seccionId, accion, datos } = await req.json()
    if (!slug || !seccionId || !ACCIONES[accion]) {
      return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 })
    }

    const supabase = obtenerClienteSupabase()
    let secciones: SeccionModular[] | null = null
    let eventoId: string | null = null

    if (supabase) {
      const { data, error } = await supabase.from('eventos').select('id, secciones, expira_en').eq('slug_publico', slug).maybeSingle()
      if (error) return NextResponse.json({ ok: false, error: 'No se pudo leer la invitación.' }, { status: 502 })
      if (!data) return NextResponse.json({ ok: false, error: 'Invitación no encontrada.' }, { status: 404 })
      if (data.expira_en && new Date(data.expira_en).getTime() < Date.now()) {
        return NextResponse.json({ ok: false, error: 'Esta invitación ya finalizó.' }, { status: 410 })
      }
      secciones = Array.isArray(data.secciones) ? data.secciones : []
      eventoId = data.id
    } else {
      const ev = ServidorAlmacen.obtenerEventoPorSlug(slug)
      if (!ev) return NextResponse.json({ ok: false, error: 'Invitación no encontrada.' }, { status: 404 })
      secciones = ev.secciones || []
      eventoId = ev.id
    }

    const seccion = secciones.find((s) => s.id === seccionId)
    if (!seccion || seccion.tipo !== ACCIONES[accion]) {
      return NextResponse.json({ ok: false, error: 'Ese bloque no admite esta acción.' }, { status: 400 })
    }

    const resultado = aplicarAccion(seccion, accion, datos || {})
    if (typeof resultado === 'string') {
      return NextResponse.json({ ok: false, error: resultado }, { status: 409 })
    }

    const nuevas = secciones.map((s) => (s.id === seccionId ? resultado : s))
    if (supabase) {
      const { error } = await supabase.from('eventos').update({ secciones: nuevas }).eq('id', eventoId)
      if (error) return NextResponse.json({ ok: false, error: 'No se pudo guardar.' }, { status: 502 })
    }
    const enCache = eventoId ? ServidorAlmacen.obtenerEventoPorId(eventoId) : null
    if (enCache) ServidorAlmacen.guardarEvento({ ...enCache, secciones: nuevas })

    return NextResponse.json({ ok: true, seccion: resultado })
  } catch (err) {
    console.error('Error en POST /api/interacciones:', err)
    return NextResponse.json({ ok: false, error: 'Error del servidor.' }, { status: 500 })
  }
}
