'use client'

import React, { useEffect, useState } from 'react'
import type { EstadoGuardado } from '@/hooks/use-autoguardado'
import { AlertTriangle, Check, CloudOff, Loader2, Redo2, Undo2, X } from 'lucide-react'

interface IndicadorGuardadoProps {
  autoguardadoActivo: boolean
  estado: EstadoGuardado
  mensajeError: string | null
  puedeDeshacer: boolean
  puedeRehacer: boolean
  alDeshacer: () => void
  alRehacer: () => void
  alReintentar: () => void
  compacto?: boolean
}

/** Deshacer / rehacer y estado del guardado en la base de datos */
export function IndicadorGuardado({
  autoguardadoActivo,
  estado,
  mensajeError,
  puedeDeshacer,
  puedeRehacer,
  alDeshacer,
  alRehacer,
  alReintentar,
  compacto = false,
}: IndicadorGuardadoProps) {
  const botonClase =
    'h-8 w-8 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer'

  let estadoUi: React.ReactNode
  if (!autoguardadoActivo) {
    estadoUi = (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500" title="Al publicar, la invitación queda guardada en la nube y desde entonces cada cambio se guarda solo">
        <CloudOff size={13} />
        {!compacto && 'Sin publicar'}
      </span>
    )
  } else if (estado === 'guardando' || estado === 'pendiente') {
    estadoUi = (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700">
        <Loader2 size={13} className="animate-spin" />
        {!compacto && 'Guardando…'}
      </span>
    )
  } else if (estado === 'error') {
    estadoUi = (
      <button type="button" onClick={alReintentar} className="flex items-center gap-1 text-[11px] font-bold text-rose-600 cursor-pointer" title={mensajeError || undefined}>
        <AlertTriangle size={13} />
        {compacto ? 'Reintentar' : 'Sin guardar · Reintentar'}
      </button>
    )
  } else {
    estadoUi = (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700" title="Cada cambio se guarda en la base de datos y tus invitados lo ven así">
        <Check size={13} />
        {!compacto && (estado === 'guardado' ? 'Guardado en la nube' : 'Al día')}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={alDeshacer} disabled={!puedeDeshacer} className={botonClase} title="Deshacer (Ctrl+Z)" aria-label="Deshacer">
        <Undo2 size={16} />
      </button>
      <button type="button" onClick={alRehacer} disabled={!puedeRehacer} className={botonClase} title="Rehacer (Ctrl+Y)" aria-label="Rehacer">
        <Redo2 size={16} />
      </button>
      <span className="w-px h-4 bg-slate-200 mx-1" />
      {estadoUi}
    </div>
  )
}

const CLAVE_GUIA = 'tarjeton_guia_editor_v1'

const PASOS_GUIA = [
  { titulo: 'Toca para seleccionar', texto: 'Toca cualquier texto, foto o sección de la tarjeta. Aparecerán sus herramientas: fuente, tamaño, color, efectos…' },
  { titulo: 'Toca de nuevo para escribir', texto: 'Con un texto seleccionado, vuelve a tocarlo (o haz doble clic) y escribe directamente sobre la tarjeta.' },
  { titulo: 'Añade lo que quieras', texto: 'Con «Añadir» pones textos, fotos, stickers, íconos y formas. Arrástralos, gíralos y cambia su tamaño con las asas.' },
  { titulo: 'Sin miedo a equivocarte', texto: 'Deshaz con ↶ o Ctrl+Z. Una vez publicada, cada cambio se guarda solo y tus invitados lo ven exactamente así.' },
]

/** Guía breve que aparece la primera vez que se abre el editor en este dispositivo */
export function GuiaPrimerUso({ activa }: { activa: boolean }) {
  const [paso, setPaso] = useState<number | null>(null)

  useEffect(() => {
    if (!activa) return
    try {
      if (!localStorage.getItem(CLAVE_GUIA)) setPaso(0)
    } catch {}
  }, [activa])

  const cerrar = () => {
    setPaso(null)
    try {
      localStorage.setItem(CLAVE_GUIA, '1')
    } catch {}
  }

  if (paso === null) return null
  const actual = PASOS_GUIA[paso]
  const esUltimo = paso === PASOS_GUIA.length - 1

  return (
    <div className="fixed inset-x-3 bottom-24 md:bottom-6 md:left-auto md:right-6 md:w-96 z-[70] rounded-2xl bg-slate-900 text-white shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-300" role="dialog" aria-label="Guía del editor">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            Paso {paso + 1} de {PASOS_GUIA.length}
          </p>
          <p className="text-sm font-bold mt-1">{actual.titulo}</p>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{actual.texto}</p>
        </div>
        <button type="button" onClick={cerrar} className="p-1 -mr-1 rounded-full text-slate-400 hover:text-white cursor-pointer" aria-label="Cerrar guía">
          <X size={16} />
        </button>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-1">
          {PASOS_GUIA.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === paso ? 'w-5 bg-amber-400' : 'w-1.5 bg-slate-600'}`} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => (esUltimo ? cerrar() : setPaso(paso + 1))}
          className="h-8 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
        >
          {esUltimo ? '¡A diseñar!' : 'Siguiente'}
        </button>
      </div>
    </div>
  )
}
