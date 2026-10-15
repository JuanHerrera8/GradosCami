'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { DetalleEvento, ExperienciaInvitado, Invitado } from '@/types/invitation'
import { construirUrlWhatsApp } from '@/lib/event-utils'
import { infoEvento } from '@/lib/estudio/eventos'
import { enlaceGoogleCalendar, esInvitadoReal, fechaLarga } from './contexto'

export interface RespuestaInvitado {
  estado: 'confirmado' | 'no_asiste'
  cupos: number
}

const DIETAS = [
  { id: 'vegetariano', nombre: 'Vegetariano' },
  { id: 'vegano', nombre: 'Vegano' },
  { id: 'sin_gluten', nombre: 'Sin gluten' },
  { id: 'infantil', nombre: 'Menú infantil' },
]

export function claveRespuesta(eventoId: string, invitado: Invitado | null) {
  return `tarjeton_rsvp_${eventoId}_${invitado?.codigoAcceso || 'anon'}`
}

/** Respuesta previa guardada en este teléfono o registrada en la base de datos */
export function leerRespuestaGuardada(eventoId: string, invitado: Invitado | null): RespuestaInvitado | null {
  try {
    const guardado = localStorage.getItem(claveRespuesta(eventoId, invitado))
    if (guardado) {
      const r = JSON.parse(guardado)
      return { estado: r.estadoConfirmacion === 'no_asiste' ? 'no_asiste' : 'confirmado', cupos: Number(r.cuposConfirmados) || 0 }
    }
  } catch {}
  if (esInvitadoReal(invitado) && invitado.estadoConfirmacion && invitado.estadoConfirmacion !== 'pendiente') {
    return { estado: invitado.estadoConfirmacion, cupos: invitado.cuposConfirmados || 0 }
  }
  return null
}

function Confeti({ colores }: { colores: string[] }) {
  const piezas = useMemo(
    () =>
      Array.from({ length: 42 }).map((_, i) => ({
        x: Math.random() * 100,
        retraso: Math.random() * 0.4,
        giro: Math.random() * 540 - 270,
        color: colores[i % colores.length],
        ancho: 6 + Math.random() * 6,
        redondo: i % 3 === 0,
      })),
    [colores]
  )
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {piezas.map((p, i) => (
        <motion.span
          key={i}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: 520, opacity: 0, rotate: p.giro }}
          transition={{ duration: 1.8 + Math.random(), delay: p.retraso, ease: 'easeIn' }}
          style={{ position: 'absolute', top: 0, left: `${p.x}%`, width: p.ancho, height: p.redondo ? p.ancho : p.ancho * 0.5, borderRadius: p.redondo ? 999 : 2, backgroundColor: p.color }}
        />
      ))}
    </div>
  )
}

interface ConfirmacionAsistenciaProps {
  abierta: boolean
  alCerrar: () => void
  evento: DetalleEvento
  invitado: Invitado | null
  experiencia: ExperienciaInvitado
  /** En vista previa del editor no se envía nada a la base de datos */
  simulada?: boolean
  alResponder: (r: RespuestaInvitado) => void
  respuestaPrevia: RespuestaInvitado | null
}

type Paso = 'pregunta' | 'si' | 'no' | 'listo'

const SEGUNDOS_AUTOCIERRE = 4

export function ConfirmacionAsistencia({
  abierta,
  alCerrar,
  evento,
  invitado,
  experiencia,
  simulada = false,
  alResponder,
  respuestaPrevia,
}: ConfirmacionAsistenciaProps) {
  const info = infoEvento(evento.tipoEvento)
  const real = esInvitadoReal(invitado)
  const maximo = real ? Math.max(1, invitado.pases || 1) : 10
  const [paso, setPaso] = useState<Paso>('pregunta')
  const [cupos, setCupos] = useState(maximo)
  const [nombre, setNombre] = useState(real ? invitado.nombre : '')
  const [dietas, setDietas] = useState<string[]>([])
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<RespuestaInvitado | null>(null)
  const colores = [evento.configuracionVisual?.colorPrimario || '#B4566A', evento.configuracionVisual?.colorSecundario || '#8BA888', '#F6C445']

  const [autoCierre, setAutoCierre] = useState(false)
  const alCerrarRef = useRef(alCerrar)
  alCerrarRef.current = alCerrar
  const estabaAbierta = useRef(false)

  // Reiniciar solo al abrir. Si dependiera de la respuesta, al confirmar volvería a la pregunta.
  useEffect(() => {
    if (abierta && !estabaAbierta.current) {
      setPaso('pregunta')
      setError(null)
      setAutoCierre(false)
      setCupos(respuestaPrevia?.estado === 'confirmado' && respuestaPrevia.cupos > 0 ? Math.min(maximo, respuestaPrevia.cupos) : maximo)
    }
    estabaAbierta.current = abierta
  }, [abierta, maximo, respuestaPrevia])

  // Tras responder, la hoja se cierra sola; se detiene si el invitado toca algo (calendario, WhatsApp)
  useEffect(() => {
    if (paso !== 'listo' || !autoCierre) return
    const t = setTimeout(() => alCerrarRef.current(), SEGUNDOS_AUTOCIERRE * 1000)
    return () => clearTimeout(t)
  }, [paso, autoCierre])

  const enviar = async (estado: 'confirmado' | 'no_asiste') => {
    const nombreFinal = (real ? invitado.nombre : nombre).trim()
    if (!nombreFinal) {
      setError('Escribe tu nombre para que sepan quién eres.')
      return
    }
    setEnviando(true)
    setError(null)
    const textoDietas = dietas.length ? `Restricciones: ${dietas.map((d) => DIETAS.find((x) => x.id === d)?.nombre).join(', ')}. ` : ''
    const respuesta: RespuestaInvitado = { estado, cupos: estado === 'confirmado' ? cupos : 0 }

    if (!simulada) {
      try {
        const res = await fetch('/api/invitados/confirmar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventoId: evento.id,
            slugPublico: evento.slugPublico,
            id: real ? invitado.id : undefined,
            codigoAcceso: real ? invitado.codigoAcceso : undefined,
            nombre: nombreFinal,
            estadoConfirmacion: estado,
            cuposConfirmados: respuesta.cupos,
            mensajeConfirmacion: (textoDietas + mensaje).trim() || undefined,
          }),
        })
        if (!res.ok) throw new Error()
        try {
          localStorage.setItem(
            claveRespuesta(evento.id, invitado),
            JSON.stringify({ nombre: nombreFinal, estadoConfirmacion: estado, cuposConfirmados: respuesta.cupos, fechaConfirmacion: new Date().toISOString() })
          )
        } catch {}
      } catch {
        setEnviando(false)
        setError('No pudimos enviar tu respuesta. Revisa tu conexión e intenta de nuevo.')
        return
      }
    }
    setEnviando(false)
    setResultado(respuesta)
    alResponder(respuesta)
    setAutoCierre(true)
    setPaso('listo')
  }

  const usaWhatsApp = (evento.metodoConfirmacion === 'whatsapp' || evento.metodoConfirmacion === 'ambos') && Boolean(evento.whatsappNumero)
  const anfitriones = evento.anfitriones

  const chip = (activo: boolean): React.CSSProperties => ({
    minHeight: 40,
    padding: '0 14px',
    borderRadius: 999,
    font: 'inherit',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    backgroundColor: activo ? 'var(--inv-tinta)' : 'var(--inv-tarjeta)',
    color: activo ? 'var(--inv-tarjeta)' : 'var(--inv-tinta)',
    border: activo ? '1.5px solid var(--inv-tinta)' : '1.5px solid var(--inv-linea)',
  })
  const botonPrincipal: React.CSSProperties = {
    width: '100%',
    minHeight: 58,
    borderRadius: 'var(--inv-radio-control)',
    border: 0,
    backgroundColor: 'var(--inv-acento)',
    color: 'var(--inv-texto-acento)',
    font: 'inherit',
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
  }
  const botonSecundario: React.CSSProperties = {
    width: '100%',
    minHeight: 52,
    borderRadius: 'var(--inv-radio-control)',
    border: '1.5px solid var(--inv-linea)',
    backgroundColor: 'transparent',
    color: 'var(--inv-acento)',
    font: 'inherit',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
  }
  const campo: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: 12,
    borderRadius: 14,
    border: '1.5px solid var(--inv-linea)',
    backgroundColor: 'var(--inv-tarjeta)',
    color: 'var(--inv-tinta)',
    font: 'inherit',
    fontSize: 15,
    resize: 'none',
  }

  return (
    <AnimatePresence>
      {abierta && (
        <motion.div
          key="fondo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={alCerrar}
          style={{ position: 'fixed', inset: 0, zIndex: 90, backgroundColor: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar asistencia"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 440,
              maxHeight: '92vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
              borderRadius: '28px 28px 0 0',
              backgroundColor: 'var(--inv-tarjeta)',
              color: 'var(--inv-tinta)',
              fontFamily: 'var(--inv-fuente-cuerpo)',
              padding: '14px 20px max(24px, env(safe-area-inset-bottom))',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div style={{ width: 44, height: 5, borderRadius: 999, backgroundColor: 'var(--inv-linea)', alignSelf: 'center' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
              <span style={{ fontFamily: 'var(--inv-fuente-titulo)', fontSize: 26, lineHeight: 1.1 }}>{anfitriones}</span>
              <span style={{ fontSize: 13, color: 'var(--inv-tinta-suave)' }}>{fechaLarga(evento.fechaEvento)}</span>
            </div>

            {paso === 'pregunta' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {real && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--inv-acento)' }}>
                      {invitado.nombre} · {maximo} {maximo === 1 ? 'lugar' : 'lugares'}
                    </span>
                  )}
                  <h2 style={{ margin: 0, fontFamily: 'var(--inv-fuente-titulo)', fontSize: 30, fontWeight: 500, lineHeight: 1.1 }}>{info.rsvp.pregunta}</h2>
                </div>
                <button type="button" onClick={() => setPaso('si')} style={botonPrincipal}>
                  {info.rsvp.botonSi}
                </button>
                <button type="button" onClick={() => setPaso('no')} style={botonSecundario}>
                  {info.rsvp.botonNo}
                </button>
              </>
            )}

            {paso === 'si' && (
              <>
                <h2 style={{ margin: 0, fontFamily: 'var(--inv-fuente-titulo)', fontSize: 26, fontWeight: 500 }}>¡Qué alegría!</h2>
                {!real && (
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, fontWeight: 700 }}>
                    Tu nombre
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} style={{ ...campo, minHeight: 48 }} />
                  </label>
                )}
                {maximo > 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>¿Cuántos van?</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 18, backgroundColor: 'var(--inv-suave)' }}>
                      <button type="button" aria-label="Uno menos" onClick={() => setCupos(Math.max(1, cupos - 1))} style={{ width: 52, height: 52, borderRadius: 14, border: 0, backgroundColor: 'var(--inv-tarjeta)', color: 'var(--inv-tinta)', font: 'inherit', fontSize: 24, fontWeight: 700, cursor: 'pointer' }}>
                        −
                      </button>
                      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--inv-fuente-titulo)', fontSize: 34, lineHeight: 1 }}>{cupos}</span>
                        <span style={{ fontSize: 12, color: 'var(--inv-tinta-suave)' }}>{real ? `de ${maximo} lugares` : cupos === 1 ? 'persona' : 'personas'}</span>
                      </span>
                      <button type="button" aria-label="Uno más" onClick={() => setCupos(Math.min(maximo, cupos + 1))} style={{ width: 52, height: 52, borderRadius: 14, border: 0, backgroundColor: 'var(--inv-tarjeta)', color: 'var(--inv-tinta)', font: 'inherit', fontSize: 24, fontWeight: 700, cursor: 'pointer' }}>
                        +
                      </button>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>¿Alguna restricción en la comida?</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <button type="button" aria-pressed={dietas.length === 0} onClick={() => setDietas([])} style={chip(dietas.length === 0)}>
                      Ninguna
                    </button>
                    {DIETAS.map((d) => {
                      const activa = dietas.includes(d.id)
                      return (
                        <button key={d.id} type="button" aria-pressed={activa} onClick={() => setDietas(activa ? dietas.filter((x) => x !== d.id) : [...dietas, d.id])} style={chip(activa)}>
                          {d.nombre}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, fontWeight: 700 }}>
                  Un mensaje para {anfitriones} (opcional)
                  <textarea rows={2} value={mensaje} onChange={(e) => setMensaje(e.target.value)} maxLength={300} style={campo} />
                </label>
                {error && <p role="alert" style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#B42318' }}>{error}</p>}
                <button type="button" onClick={() => enviar('confirmado')} disabled={enviando} style={{ ...botonPrincipal, opacity: enviando ? 0.6 : 1 }}>
                  {enviando ? 'Enviando…' : 'Enviar confirmación'}
                </button>
                <button type="button" onClick={() => setPaso('pregunta')} style={{ border: 0, background: 'none', color: 'var(--inv-acento)', font: 'inherit', fontSize: 14, fontWeight: 700, minHeight: 40, cursor: 'pointer' }}>
                  Volver
                </button>
              </>
            )}

            {paso === 'no' && (
              <>
                <h2 style={{ margin: 0, fontFamily: 'var(--inv-fuente-titulo)', fontSize: 26, fontWeight: 500 }}>Te vamos a extrañar</h2>
                {!real && (
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, fontWeight: 700 }}>
                    Tu nombre
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} style={{ ...campo, minHeight: 48 }} />
                  </label>
                )}
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, fontWeight: 700 }}>
                  ¿Quieres dejar un mensaje?
                  <textarea rows={3} value={mensaje} onChange={(e) => setMensaje(e.target.value)} maxLength={300} style={campo} />
                </label>
                {error && <p role="alert" style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#B42318' }}>{error}</p>}
                <button type="button" onClick={() => enviar('no_asiste')} disabled={enviando} style={{ ...botonPrincipal, backgroundColor: 'var(--inv-tinta)', color: 'var(--inv-tarjeta)', opacity: enviando ? 0.6 : 1 }}>
                  {enviando ? 'Enviando…' : 'Enviar respuesta'}
                </button>
                <button type="button" onClick={() => setPaso('pregunta')} style={{ border: 0, background: 'none', color: 'var(--inv-acento)', font: 'inherit', fontSize: 14, fontWeight: 700, minHeight: 40, cursor: 'pointer' }}>
                  Volver
                </button>
              </>
            )}

            {paso === 'listo' && resultado && (
              <div onPointerDown={() => setAutoCierre(false)} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', padding: '10px 0' }}>
                {resultado.estado === 'confirmado' && experiencia.confetiAlConfirmar && <Confeti colores={colores} />}
                <div style={{ width: 72, height: 72, borderRadius: 999, backgroundColor: 'var(--inv-suave)', color: 'var(--inv-acento)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </div>
                <h2 style={{ margin: 0, fontFamily: 'var(--inv-fuente-titulo)', fontSize: 28, fontWeight: 500 }}>
                  {resultado.estado === 'confirmado' ? '¡Nos vemos allá!' : 'Gracias por avisarnos'}
                </h2>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--inv-tinta-suave)' }}>
                  {resultado.estado === 'confirmado'
                    ? `Confirmaste ${resultado.cupos}${real ? ` de ${maximo}` : ''} ${resultado.cupos === 1 ? 'lugar' : 'lugares'}. ${anfitriones} ya recibieron tu respuesta.`
                    : `${anfitriones} ya recibieron tu respuesta.`}
                  {simulada ? ' (Vista previa: no se guardó nada.)' : ''}
                </p>
                {resultado.estado === 'confirmado' && experiencia.botonCalendario && (
                  <a href={enlaceGoogleCalendar(evento)} target="_blank" rel="noopener noreferrer" style={{ ...botonSecundario, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', backgroundColor: 'var(--inv-suave)', border: 0, color: 'var(--inv-tinta)' }}>
                    Agregar a mi calendario
                  </a>
                )}
                {usaWhatsApp && (
                  <a href={construirUrlWhatsApp(evento, invitado || undefined)} target="_blank" rel="noopener noreferrer" style={{ ...botonSecundario, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                    Avisar también por WhatsApp
                  </a>
                )}
                <button type="button" onClick={alCerrar} style={{ ...botonPrincipal, position: 'relative', overflow: 'hidden' }}>
                  {autoCierre && (
                    <motion.span
                      aria-hidden="true"
                      initial={{ scaleX: 1 }}
                      animate={{ scaleX: 0 }}
                      transition={{ duration: SEGUNDOS_AUTOCIERRE, ease: 'linear' }}
                      style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 4, transformOrigin: 'left', backgroundColor: 'var(--inv-texto-acento)', opacity: 0.45 }}
                    />
                  )}
                  {autoCierre ? 'Listo · se cierra sola' : 'Listo'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
