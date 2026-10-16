'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { DetalleEvento, Invitado, TipoApertura } from '@/types/invitation'
import type { TemaInvitacion } from './tema'
import { esInvitadoReal, fechaLarga } from './contexto'

/** 'Valentina & Andrés' → 'V&A' · 'Isabella' → 'I' */
export function monograma(nombres: string): string {
  const partes = nombres.split(/\s*(?:&|y)\s*/i).filter(Boolean)
  if (partes.length >= 2) return `${partes[0].trim()[0] || ''}&${partes[1].trim()[0] || ''}`.toUpperCase()
  return (nombres.trim()[0] || '★').toUpperCase()
}

const INSTRUCCIONES: Record<TipoApertura, string> = {
  sobre: 'Toca el sello para abrir',
  telon: 'Toca para abrir el telón',
  raspa: 'Raspa con el dedo para descubrir',
  caja: 'Toca la caja para abrirla',
  directo: '',
}

function Raspadita({ tema, alDescubrir, fecha }: { tema: TemaInvitacion; alDescubrir: () => void; fecha: string }) {
  const lienzo = useRef<HTMLCanvasElement | null>(null)
  const raspando = useRef(false)
  const avisado = useRef(false)

  useEffect(() => {
    const c = lienzo.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const escala = window.devicePixelRatio || 1
    c.width = c.offsetWidth * escala
    c.height = c.offsetHeight * escala
    ctx.scale(escala, escala)
    const degradado = ctx.createLinearGradient(0, 0, c.offsetWidth, c.offsetHeight)
    degradado.addColorStop(0, '#C9C9CE')
    degradado.addColorStop(0.5, '#E4E4E8')
    degradado.addColorStop(1, '#B8B8BE')
    ctx.fillStyle = degradado
    ctx.fillRect(0, 0, c.offsetWidth, c.offsetHeight)
    ctx.fillStyle = '#5A5A62'
    ctx.font = '600 15px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Raspa aquí', c.offsetWidth / 2, c.offsetHeight / 2 + 5)
  }, [])

  const raspar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!raspando.current) return
    const c = lienzo.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const r = c.getBoundingClientRect()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(e.clientX - r.left, e.clientY - r.top, 22, 0, Math.PI * 2)
    ctx.fill()
    // Al descubrir casi la mitad, se abre sola
    const datos = ctx.getImageData(0, 0, c.width, c.height).data
    let vacios = 0
    for (let i = 3; i < datos.length; i += 64) if (datos[i] === 0) vacios++
    if (!avisado.current && vacios / (datos.length / 64) > 0.45) {
      avisado.current = true
      setTimeout(alDescubrir, 400)
    }
  }

  return (
    <div style={{ position: 'relative', width: 150, height: 150, borderRadius: 999, overflow: 'hidden', backgroundColor: tema.tarjeta, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 12, boxSizing: 'border-box' }}>
      <span style={{ fontFamily: tema.familiaTitulo, fontSize: 18, color: tema.tinta, lineHeight: 1.2 }}>{fecha}</span>
      <canvas
        ref={lienzo}
        aria-label="Zona para raspar"
        onPointerDown={(e) => {
          raspando.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          raspar(e)
        }}
        onPointerMove={raspar}
        onPointerUp={() => (raspando.current = false)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  )
}

interface AperturaProps {
  tipo: TipoApertura
  tema: TemaInvitacion
  evento: DetalleEvento
  invitado: Invitado | null
  saludoPersonal: boolean
  /** Dentro de un marco (vista previa del editor) en lugar de pantalla completa */
  contenida?: boolean
  alAbrir: () => void
}

export function AperturaInvitacion({ tipo, tema, evento, invitado, saludoPersonal, contenida = false, alAbrir }: AperturaProps) {
  const [abriendo, setAbriendo] = useState(false)
  const [visible, setVisible] = useState(tipo !== 'directo')

  useEffect(() => {
    if (tipo === 'directo') alAbrir()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo])

  const abrir = () => {
    if (abriendo) return
    setAbriendo(true)
    setTimeout(() => {
      setVisible(false)
      alAbrir()
    }, tipo === 'telon' ? 1100 : 900)
  }

  const nombres = evento.anfitriones || evento.titulo
  const real = esInvitadoReal(invitado)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="apertura"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: contenida ? 'absolute' : 'fixed',
            inset: 0,
            zIndex: 80,
            backgroundColor: tema.fondo,
            color: tema.tinta,
            fontFamily: tema.familiaCuerpo,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 26,
            padding: 24,
            overflow: 'hidden',
          }}
        >
          {real && saludoPersonal && (
            <div style={{ position: 'absolute', top: 24, left: 16, right: 16, margin: '0 auto', maxWidth: 380, padding: '12px 16px', borderRadius: 16, backgroundColor: tema.tarjeta, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Hola, {invitado.nombre}</span>
              <span style={{ fontSize: 13, opacity: 0.75 }}>
                {invitado.pases > 1 ? `Reservamos ${invitado.pases} lugares para ustedes` : 'Tenemos un lugar reservado para ti'}
              </span>
            </div>
          )}

          {tipo === 'sobre' && (
            <button type="button" onClick={abrir} aria-label="Abrir la invitación" style={{ position: 'relative', width: 270, height: 176, border: 0, padding: 0, background: 'none', cursor: 'pointer', perspective: 800 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: 10, backgroundColor: `color-mix(in srgb, ${tema.acento} 14%, ${tema.tarjeta})`, boxShadow: '0 16px 32px rgba(15,23,42,0.18)' }} />
              <motion.span
                animate={abriendo ? { rotateX: 180 } : { rotateX: 0 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
                style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, borderLeft: '135px solid transparent', borderRight: '135px solid transparent', borderTop: `100px solid color-mix(in srgb, ${tema.acento} 24%, ${tema.tarjeta})`, transformOrigin: 'top center' }}
              />
              <motion.span
                animate={abriendo ? { scale: 0, opacity: 0 } : { scale: [1, 1.06, 1] }}
                transition={abriendo ? { duration: 0.3 } : { duration: 1.6, repeat: Infinity }}
                style={{ position: 'absolute', left: '50%', top: 74, width: 58, height: 58, marginLeft: -29, borderRadius: 999, backgroundColor: tema.acento, color: tema.textoAcento, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: tema.familiaTitulo, fontSize: 22, boxShadow: '0 3px 8px rgba(0,0,0,0.3)' }}
              >
                {monograma(nombres)}
              </motion.span>
            </button>
          )}

          {tipo === 'telon' && (
            <button type="button" onClick={abrir} aria-label="Abrir el telón" style={{ position: 'absolute', inset: 0, border: 0, padding: 0, background: 'none', cursor: 'pointer' }}>
              <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: tema.familiaTitulo, fontSize: tema.tituloCaligrafico ? 46 : 34, color: tema.tinta, padding: 24, textAlign: 'center' }}>{nombres}</span>
              <motion.span
                animate={abriendo ? { x: '-100%' } : { x: 0 }}
                transition={{ duration: 1, ease: [0.7, 0, 0.3, 1] }}
                style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '51%', background: `repeating-linear-gradient(90deg, ${tema.acento} 0 14px, color-mix(in srgb, ${tema.acento} 80%, #000) 14px 28px)`, boxShadow: '6px 0 18px rgba(0,0,0,0.3)' }}
              />
              <motion.span
                animate={abriendo ? { x: '100%' } : { x: 0 }}
                transition={{ duration: 1, ease: [0.7, 0, 0.3, 1] }}
                style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '51%', background: `repeating-linear-gradient(90deg, color-mix(in srgb, ${tema.acento} 80%, #000) 0 14px, ${tema.acento} 14px 28px)`, boxShadow: '-6px 0 18px rgba(0,0,0,0.3)' }}
              />
            </button>
          )}

          {tipo === 'raspa' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '26px 20px', borderRadius: tema.radioTarjeta, backgroundColor: tema.tarjeta, textAlign: 'center' }}>
              <span style={{ fontFamily: tema.familiaTitulo, fontSize: tema.tituloCaligrafico ? 40 : 30, lineHeight: 1.1 }}>{nombres}</span>
              <Raspadita tema={tema} alDescubrir={abrir} fecha={fechaLarga(evento.fechaEvento)} />
            </div>
          )}

          {tipo === 'caja' && (
            <button type="button" onClick={abrir} aria-label="Abrir la caja" style={{ position: 'relative', width: 180, height: 180, border: 0, padding: 0, background: 'none', cursor: 'pointer' }}>
              <motion.span animate={abriendo ? { scale: 1.3, opacity: 0 } : { scale: 1 }} transition={{ duration: 0.6, delay: 0.25 }} style={{ position: 'absolute', left: 12, right: 12, bottom: 0, height: 124, borderRadius: 12, backgroundColor: tema.acento }} />
              <motion.span animate={abriendo ? { scale: 1.3, opacity: 0 } : { scale: 1 }} transition={{ duration: 0.6, delay: 0.25 }} style={{ position: 'absolute', left: '50%', bottom: 0, height: 124, width: 24, marginLeft: -12, backgroundColor: tema.detalle }} />
              <motion.span animate={abriendo ? { y: -160, rotate: -24, opacity: 0 } : { y: 0 }} transition={{ duration: 0.7 }} style={{ position: 'absolute', left: 0, right: 0, top: 30, height: 36, borderRadius: 10, backgroundColor: `color-mix(in srgb, ${tema.acento} 80%, #000)` }}>
                <span style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 24, marginLeft: -12, backgroundColor: tema.detalle }} />
                <span style={{ position: 'absolute', left: '50%', top: -28, width: 64, height: 30, marginLeft: -32, border: `9px solid ${tema.detalle}`, borderBottom: 0, borderRadius: '32px 32px 0 0', boxSizing: 'border-box' }} />
              </motion.span>
            </button>
          )}

          {!abriendo && INSTRUCCIONES[tipo] && (
            <span style={{ position: tipo === 'telon' ? 'absolute' : 'static', bottom: 40, fontSize: 14, fontWeight: 600, opacity: 0.8, zIndex: 1, padding: '8px 14px', borderRadius: 999, backgroundColor: tipo === 'telon' ? 'rgba(0,0,0,0.35)' : 'transparent', color: tipo === 'telon' ? '#FFFFFF' : tema.tinta }}>
              {INSTRUCCIONES[tipo]}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
