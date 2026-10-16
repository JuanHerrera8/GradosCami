'use client'

import { useCallback, useRef, useState } from 'react'
import type { ConfiguracionVisual, DetalleEvento, SeccionModular } from '@/types/invitation'

export interface EstadoEditor {
  evento: DetalleEvento
  visual: ConfiguracionVisual
  secciones: SeccionModular[]
}

type Actualizacion<T> = T | ((previo: T) => T)

const LIMITE_HISTORIAL = 100
// Cambios seguidos más rápidos que esto (escribir, arrastrar un deslizador) se agrupan en un solo paso
const VENTANA_AGRUPACION_MS = 700

function resolver<T>(actualizacion: Actualizacion<T>, previo: T): T {
  return typeof actualizacion === 'function' ? (actualizacion as (p: T) => T)(previo) : actualizacion
}

/**
 * Estado del editor (evento + diseño + secciones) con historial de deshacer/rehacer.
 * Expone setters compatibles con useState para no tener que reescribir el editor existente.
 */
export function useHistorialEditor(inicial: () => EstadoEditor) {
  const [estado, setEstado] = useState<EstadoEditor>(inicial)
  const actual = useRef<EstadoEditor>(estado)
  const pasado = useRef<EstadoEditor[]>([])
  const futuro = useRef<EstadoEditor[]>([])
  const ultimoCambio = useRef(0)
  const [, setVersion] = useState(0)

  const confirmar = useCallback((siguiente: EstadoEditor, agrupar: boolean) => {
    const previo = actual.current
    if (siguiente === previo) return
    const ahora = Date.now()
    const puedeAgrupar = agrupar && ahora - ultimoCambio.current < VENTANA_AGRUPACION_MS && pasado.current.length > 0
    if (!puedeAgrupar) {
      pasado.current.push(previo)
      if (pasado.current.length > LIMITE_HISTORIAL) pasado.current.shift()
    }
    ultimoCambio.current = ahora
    futuro.current = []
    actual.current = siguiente
    setEstado(siguiente)
    setVersion((v) => v + 1)
  }, [])

  const setEvento = useCallback(
    (act: Actualizacion<DetalleEvento>) => {
      const previo = actual.current
      const evento = resolver(act, previo.evento)
      if (evento !== previo.evento) confirmar({ ...previo, evento }, true)
    },
    [confirmar]
  )

  const setVisual = useCallback(
    (act: Actualizacion<ConfiguracionVisual>) => {
      const previo = actual.current
      const visual = resolver(act, previo.visual)
      if (visual !== previo.visual) confirmar({ ...previo, visual }, true)
    },
    [confirmar]
  )

  const setSecciones = useCallback(
    (act: Actualizacion<SeccionModular[]>) => {
      const previo = actual.current
      const secciones = resolver(act, previo.secciones)
      if (secciones !== previo.secciones) confirmar({ ...previo, secciones }, true)
    },
    [confirmar]
  )

  /** Cierra el grupo actual: el próximo cambio será un paso independiente del historial */
  const cortarGrupo = useCallback(() => {
    ultimoCambio.current = 0
  }, [])

  const deshacer = useCallback(() => {
    const previo = pasado.current.pop()
    if (!previo) return
    futuro.current.push(actual.current)
    actual.current = previo
    ultimoCambio.current = 0
    setEstado(previo)
    setVersion((v) => v + 1)
  }, [])

  const rehacer = useCallback(() => {
    const siguiente = futuro.current.pop()
    if (!siguiente) return
    pasado.current.push(actual.current)
    actual.current = siguiente
    ultimoCambio.current = 0
    setEstado(siguiente)
    setVersion((v) => v + 1)
  }, [])

  return {
    evento: estado.evento,
    visual: estado.visual,
    secciones: estado.secciones,
    estadoActual: actual,
    setEvento,
    setVisual,
    setSecciones,
    cortarGrupo,
    deshacer,
    rehacer,
    puedeDeshacer: pasado.current.length > 0,
    puedeRehacer: futuro.current.length > 0,
  }
}
