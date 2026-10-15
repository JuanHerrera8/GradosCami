'use client'

import React from 'react'
import { Drawer as Vaul } from 'vaul'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { ElementoLienzo, SeccionModular } from '@/types/invitation'
import type { Seleccion } from './contexto-editor'
import { CATALOGO_SECCIONES } from '@/lib/modular-defaults'
import { IconoDinamico } from '@/components/ui/icono-dinamico'
import { obtenerSticker } from '@/lib/editor/stickers'
import { Eye, EyeOff, GripVertical, ImageIcon, Lock, Shapes, Smile, Sticker, Trash2, Type, Unlock, X } from 'lucide-react'

export interface PanelCapasProps {
  abierto: boolean
  alCerrar: () => void
  esMovil: boolean
  secciones: SeccionModular[]
  seleccion: Seleccion
  alSeleccionar: (s: Seleccion) => void
  alReordenarSecciones: (idOrigen: string, idDestino: string) => void
  alReordenarCapas: (seccionId: string, idsDeArribaHaciaAbajo: string[]) => void
  alAlternarSeccion: (seccionId: string) => void
  alActualizarElemento: (seccionId: string, elementoId: string, cambios: Partial<ElementoLienzo>) => void
  alEliminarElemento: (seccionId: string, elementoId: string) => void
}

function useSensoresArrastre() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // En táctil se activa con una pulsación corta, así el dedo puede seguir desplazando la lista
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
}

function FilaOrdenable({
  id,
  seleccionada,
  alPulsar,
  children,
  acciones,
}: {
  id: string
  seleccionada: boolean
  alPulsar: () => void
  children: React.ReactNode
  acciones?: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-1 rounded-xl border bg-white pr-1 ${
        isDragging ? 'shadow-xl z-10 relative border-amber-400' : seleccionada ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        data-vaul-no-drag
        className="h-11 w-9 flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing touch-none shrink-0"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical size={16} />
      </button>
      <button type="button" onClick={alPulsar} className="flex-1 min-w-0 h-11 text-left flex items-center gap-2 cursor-pointer">
        {children}
      </button>
      {acciones}
    </div>
  )
}

function descripcionElemento(el: ElementoLienzo): { icono: React.ReactNode; nombre: string } {
  switch (el.tipo) {
    case 'texto':
      return { icono: <Type size={15} />, nombre: el.texto?.slice(0, 32) || 'Texto' }
    case 'imagen':
      return { icono: <ImageIcon size={15} />, nombre: 'Foto' }
    case 'sticker':
      return { icono: <Sticker size={15} />, nombre: obtenerSticker(el.stickerId)?.nombre || 'Sticker' }
    case 'icono':
      return { icono: <Smile size={15} />, nombre: `Ícono ${el.icono || ''}` }
    case 'forma':
      return { icono: <Shapes size={15} />, nombre: `Forma ${el.forma || ''}` }
  }
}

function ContenidoCapas(props: PanelCapasProps) {
  const sensores = useSensoresArrastre()
  const ordenadas = [...props.secciones].sort((a, b) => a.orden - b.orden)
  const seccionActiva = props.seleccion ? ordenadas.find((s) => s.id === props.seleccion!.seccionId) : undefined
  const capas = [...(seccionActiva?.elementos || [])].sort((a, b) => b.z - a.z)

  const alSoltarSeccion = (e: DragEndEvent) => {
    if (e.over && e.active.id !== e.over.id) props.alReordenarSecciones(String(e.active.id), String(e.over.id))
  }

  const alSoltarCapa = (e: DragEndEvent) => {
    if (!seccionActiva || !e.over || e.active.id === e.over.id) return
    const ids = capas.map((c) => c.id)
    const nuevo = arrayMove(ids, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id)))
    props.alReordenarCapas(seccionActiva.id, nuevo)
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-6 space-y-5">
      {seccionActiva && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Elementos de «{seccionActiva.titulo || 'Sección'}» (arriba = al frente)
          </p>
          {capas.length === 0 ? (
            <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3">Esta sección aún no tiene elementos libres.</p>
          ) : (
            <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={alSoltarCapa}>
              <SortableContext items={capas.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1.5">
                  {capas.map((el) => {
                    const d = descripcionElemento(el)
                    const seleccionada = props.seleccion?.tipo === 'elemento' && props.seleccion.elementoId === el.id
                    return (
                      <FilaOrdenable
                        key={el.id}
                        id={el.id}
                        seleccionada={seleccionada}
                        alPulsar={() => props.alSeleccionar({ tipo: 'elemento', seccionId: seccionActiva.id, elementoId: el.id })}
                        acciones={
                          <div className="flex items-center shrink-0">
                            <button type="button" onClick={() => props.alActualizarElemento(seccionActiva.id, el.id, { oculto: !el.oculto })} className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer" aria-label={el.oculto ? 'Mostrar' : 'Ocultar'}>
                              {el.oculto ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                            <button type="button" onClick={() => props.alActualizarElemento(seccionActiva.id, el.id, { bloqueado: !el.bloqueado })} className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer" aria-label={el.bloqueado ? 'Desbloquear' : 'Bloquear'}>
                              {el.bloqueado ? <Lock size={15} className="text-amber-600" /> : <Unlock size={15} />}
                            </button>
                            <button type="button" onClick={() => props.alEliminarElemento(seccionActiva.id, el.id)} className="h-9 w-9 flex items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer" aria-label="Eliminar">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        }
                      >
                        <span className="text-slate-500 shrink-0">{d.icono}</span>
                        <span className={`text-xs font-semibold truncate ${el.oculto ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{d.nombre}</span>
                      </FilaOrdenable>
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Secciones de la tarjeta (arrastra para ordenar)</p>
        <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={alSoltarSeccion}>
          <SortableContext items={ordenadas.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {ordenadas.map((s) => {
                const meta = CATALOGO_SECCIONES.find((m) => m.tipo === s.tipo)
                const total = s.elementos?.length || 0
                return (
                  <FilaOrdenable
                    key={s.id}
                    id={s.id}
                    seleccionada={props.seleccion?.seccionId === s.id}
                    alPulsar={() => {
                      props.alSeleccionar({ tipo: 'seccion', seccionId: s.id })
                      document.querySelector(`[data-seccion-id="${s.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }}
                    acciones={
                      <button type="button" onClick={() => props.alAlternarSeccion(s.id)} className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer shrink-0" aria-label={s.visible ? 'Ocultar sección' : 'Mostrar sección'}>
                        {s.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                    }
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <IconoDinamico nombre={s.icono || meta?.iconoDefecto} size={13} />
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-xs font-bold truncate ${s.visible ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{s.titulo || meta?.nombre}</span>
                      <span className="block text-[10px] text-slate-500 truncate">
                        {meta?.nombre}
                        {total > 0 ? ` · ${total} elemento${total === 1 ? '' : 's'}` : ''}
                      </span>
                    </span>
                  </FilaOrdenable>
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}

export function PanelCapas(props: PanelCapasProps) {
  if (props.esMovil) {
    return (
      <Vaul.Root open={props.abierto} onOpenChange={(abrir) => !abrir && props.alCerrar()}>
        <Vaul.Portal>
          <Vaul.Overlay className="fixed inset-0 z-[60] bg-black/30" />
          <Vaul.Content className="fixed inset-x-0 bottom-0 z-[61] flex h-[70vh] flex-col rounded-t-2xl bg-white outline-none" aria-describedby={undefined}>
            <div className="mx-auto mt-2.5 mb-2 h-1.5 w-12 shrink-0 rounded-full bg-slate-300" />
            <div className="flex items-center justify-between px-4 pb-2">
              <Vaul.Title className="text-base font-bold text-slate-900">Capas</Vaul.Title>
              <button type="button" onClick={props.alCerrar} className="p-2 -mr-2 rounded-full text-slate-500 active:bg-slate-100" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <ContenidoCapas {...props} />
          </Vaul.Content>
        </Vaul.Portal>
      </Vaul.Root>
    )
  }

  return (
    <Sheet open={props.abierto} onOpenChange={(abrir) => !abrir && props.alCerrar()} modal={false}>
      <SheetContent side="right" className="w-[360px] sm:max-w-[360px] p-0 pt-4 flex flex-col gap-0">
        <SheetHeader className="px-4 pb-3 pt-0">
          <SheetTitle>Capas</SheetTitle>
        </SheetHeader>
        <ContenidoCapas {...props} />
      </SheetContent>
    </Sheet>
  )
}
