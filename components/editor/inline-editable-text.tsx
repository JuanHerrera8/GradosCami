'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useEditorLienzo, useSeccionActual } from './lienzo/contexto-editor'
import { atributosFuente, estiloTextoACss, leerTextoEditable } from '@/lib/editor/estilos'

interface InlineEditableTextProps {
  valor: string
  alGuardar: (nuevoValor: string) => void
  activo?: boolean
  multilinea?: boolean
  placeholder?: string
  etiqueta?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
  className?: string
  style?: React.CSSProperties
  /** Clave del campo: permite guardar un estilo individual (fuente, tamaño, color...) para este texto */
  campo?: string
}

/** Coloca el texto plano del portapapeles sin formato externo */
function pegarComoTextoPlano(e: React.ClipboardEvent) {
  e.preventDefault()
  const texto = e.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, texto)
}

function seleccionarContenido(el: HTMLElement) {
  const rango = document.createRange()
  rango.selectNodeContents(el)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(rango)
}

/**
 * Texto editable directamente sobre la tarjeta (WYSIWYG).
 * - Un toque lo selecciona y muestra la barra de estilo (fuente, tamaño, color...).
 * - Un segundo toque o doble clic permite escribir sobre el propio texto, con su tipografía real.
 * - Su estilo individual se guarda en la sección (`estilosTexto[campo]`) y se ve igual en la invitación publicada.
 */
export function InlineEditableText({
  valor,
  alGuardar,
  activo = false,
  multilinea = false,
  placeholder = 'Escribe aquí...',
  etiqueta: Etiqueta = 'p',
  className = '',
  style,
  campo,
}: InlineEditableTextProps) {
  const editor = useEditorLienzo()
  const seccion = useSeccionActual()
  const ref = useRef<HTMLElement | null>(null)
  const [edicionLocal, setEdicionLocal] = useState(false)

  const estiloPropio = campo ? seccion?.estilosTexto?.[campo] : undefined
  const estiloFinal: React.CSSProperties = {
    ...style,
    ...estiloTextoACss(estiloPropio),
    ...(multilinea ? { whiteSpace: 'pre-line' } : {}),
  }
  const atributos = atributosFuente(estiloPropio)

  const claveTexto = seccion && campo ? `${seccion.id}:${campo}` : null
  const usaSeleccion = Boolean(claveTexto && editor.esEdicion)
  const estaEditando = usaSeleccion ? editor.textoEnEdicion === claveTexto : edicionLocal
  const estaSeleccionado =
    usaSeleccion &&
    editor.seleccion?.tipo === 'texto' &&
    editor.seleccion.seccionId === seccion?.id &&
    editor.seleccion.campo === campo

  // Al entrar en edición: cargar el texto actual, enfocar y seleccionar todo
  useEffect(() => {
    if (!estaEditando || !ref.current) return
    const el = ref.current
    el.textContent = valor || ''
    el.focus({ preventScroll: true })
    seleccionarContenido(el)
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estaEditando])

  if (!activo) {
    return (
      <Etiqueta className={className} style={estiloFinal} {...atributos}>
        {valor || ''}
      </Etiqueta>
    )
  }

  const iniciarEdicion = () => {
    if (usaSeleccion && claveTexto) {
      editor.seleccionar({ tipo: 'texto', seccionId: seccion!.id, campo: campo! })
      editor.setTextoEnEdicion(claveTexto)
    } else {
      setEdicionLocal(true)
    }
  }

  const terminarEdicion = (guardar: boolean) => {
    const el = ref.current
    const nuevo = el ? leerTextoEditable(el).trim() : ''
    if (usaSeleccion) {
      if (editor.textoEnEdicion === claveTexto) editor.setTextoEnEdicion(null)
    } else {
      setEdicionLocal(false)
    }
    if (guardar && nuevo !== (valor || '')) {
      alGuardar(nuevo)
    }
  }

  const manejarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (estaEditando) return
    if (!usaSeleccion || estaSeleccionado) {
      iniciarEdicion()
    } else {
      editor.seleccionar({ tipo: 'texto', seccionId: seccion!.id, campo: campo! })
    }
  }

  const manejarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      if (ref.current) ref.current.textContent = valor || ''
      terminarEdicion(false)
      ref.current?.blur()
    } else if (e.key === 'Enter' && (!multilinea || e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      ref.current?.blur()
    }
    e.stopPropagation()
  }

  if (estaEditando) {
    return (
      <Etiqueta
        ref={ref as any}
        data-texto-clave={claveTexto || undefined}
        contentEditable="plaintext-only"
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onBlur={() => terminarEdicion(true)}
        onKeyDown={manejarKeyDown}
        onPaste={pegarComoTextoPlano}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
        className={`texto-editando relative inline-block max-w-full min-w-[2ch] px-1.5 py-0.5 ${className}`}
        style={estiloFinal}
        {...atributos}
      />
    )
  }

  const esVacio = !valor || valor.trim() === ''

  return (
    <Etiqueta
      data-texto-clave={claveTexto || undefined}
      onClick={manejarClick}
      onDoubleClick={(e: React.MouseEvent) => {
        e.stopPropagation()
        iniciarEdicion()
      }}
      title={estaSeleccionado ? 'Toca de nuevo para escribir' : 'Toca para seleccionar y dar estilo'}
      className={`relative group/editable cursor-pointer transition-all rounded-lg px-1.5 py-0.5 inline-block max-w-full ${className} ${
        estaSeleccionado
          ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-transparent'
          : esVacio
          ? 'italic opacity-60 bg-amber-400/10 border border-dashed border-amber-400/50'
          : 'hover:ring-2 hover:ring-amber-400/70 hover:bg-amber-400/10'
      }`}
      style={estiloFinal}
      {...atributos}
    >
      {valor || placeholder}
    </Etiqueta>
  )
}
