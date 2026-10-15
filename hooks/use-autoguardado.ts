'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { DetalleEvento } from '@/types/invitation'
import { EventoRepositorio } from '@/lib/storage'

export type EstadoGuardado = 'sin_cambios' | 'pendiente' | 'guardando' | 'guardado' | 'error'

interface OpcionesAutoguardado {
  /** Solo se autoguarda en la base de datos un evento ya publicado (tiene enlace) */
  habilitado: boolean
  /** Cambia cada vez que el diseño cambia (referencia del estado del editor) */
  dependencia: unknown
  construirEvento: () => DetalleEvento
  alGuardar?: (evento: DetalleEvento) => void
  esperaMs?: number
}

/**
 * Autoguardado en la base de datos con espera (debounce).
 * Guarda también al ocultar la pestaña (en el celular el sistema puede cerrarla en segundo plano).
 */
export function useAutoguardado({
  habilitado,
  dependencia,
  construirEvento,
  alGuardar,
  esperaMs = 1500,
}: OpcionesAutoguardado) {
  const [estado, setEstado] = useState<EstadoGuardado>('sin_cambios')
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null)
  const [mensajeError, setMensajeError] = useState<string | null>(null)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hayPendiente = useRef(false)
  const enCurso = useRef<Promise<void> | null>(null)
  const primerRender = useRef(true)
  const construirRef = useRef(construirEvento)
  const alGuardarRef = useRef(alGuardar)
  construirRef.current = construirEvento
  alGuardarRef.current = alGuardar

  const guardarAhora = useCallback(async () => {
    if (temporizador.current) {
      clearTimeout(temporizador.current)
      temporizador.current = null
    }
    if (!hayPendiente.current) return
    // Serializar: si hay un guardado en curso, esperar y luego guardar la versión más reciente
    if (enCurso.current) await enCurso.current.catch(() => {})
    hayPendiente.current = false
    setEstado('guardando')
    const tarea = (async () => {
      try {
        const persistido = await EventoRepositorio.guardarAsync(construirRef.current())
        setUltimoGuardado(new Date())
        setMensajeError(null)
        setEstado(hayPendiente.current ? 'pendiente' : 'guardado')
        alGuardarRef.current?.(persistido)
      } catch (err: any) {
        hayPendiente.current = true
        setMensajeError(err?.message || 'No se pudo guardar')
        setEstado('error')
      }
    })()
    enCurso.current = tarea
    await tarea
    enCurso.current = null
  }, [])

  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false
      return
    }
    if (!habilitado) return
    hayPendiente.current = true
    setEstado('pendiente')
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => {
      guardarAhora()
    }, esperaMs)
  }, [dependencia, habilitado, esperaMs, guardarAhora])

  // Reintento automático tras un error de red
  useEffect(() => {
    if (estado !== 'error' || !habilitado) return
    const t = setTimeout(() => guardarAhora(), 6000)
    return () => clearTimeout(t)
  }, [estado, habilitado, guardarAhora])

  useEffect(() => {
    if (!habilitado) return
    const alOcultar = () => {
      if (document.visibilityState === 'hidden') guardarAhora()
    }
    document.addEventListener('visibilitychange', alOcultar)
    return () => document.removeEventListener('visibilitychange', alOcultar)
  }, [habilitado, guardarAhora])

  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    }
  }, [])

  return {
    estado,
    ultimoGuardado,
    mensajeError,
    guardarAhora,
    tieneCambiosSinGuardar: estado === 'pendiente' || estado === 'guardando' || estado === 'error',
  }
}
