'use client'

import React from 'react'
import type { DetalleEvento, TipoEvento } from '@/types/invitation'
import { EVENTOS_INFO } from '@/lib/estudio/eventos'
import { Campo, CampoFechaHora, TituloGrupo } from './ui'

interface PanelDatosProps {
  evento: DetalleEvento
  alCambiar: (cambios: Partial<DetalleEvento>) => void
}

export function PanelDatos({ evento, alCambiar }: PanelDatosProps) {
  return (
    <div className="flex flex-col gap-4">
      <TituloGrupo>Datos del evento</TituloGrupo>
      <Campo
        etiqueta="Nombre del evento"
        valor={evento.titulo}
        alCambiar={(v) => alCambiar({ titulo: v })}
        ayuda="Aparece al compartir el enlace por WhatsApp. El enlace de la invitación no cambia."
        maximo={90}
      />
      <Campo etiqueta="Quiénes invitan" valor={evento.anfitriones} alCambiar={(v) => alCambiar({ anfitriones: v })} maximo={90} />
      <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-700">
        Tipo de evento
        <select value={evento.tipoEvento} onChange={(e) => alCambiar({ tipoEvento: e.target.value as TipoEvento })} className="min-h-11 px-3 rounded-xl border border-slate-300 bg-white text-[15px] text-slate-900 cursor-pointer">
          {EVENTOS_INFO.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </label>
      <CampoFechaHora fechaIso={evento.fechaEvento} alCambiar={(fechaEvento, horaEvento) => alCambiar({ fechaEvento, horaEvento })} />
      <Campo etiqueta="Lugar" valor={evento.direccion} alCambiar={(v) => alCambiar({ direccion: v })} />
      <p className="m-0 p-3 rounded-xl bg-slate-100 text-[13px] leading-snug text-slate-700">
        La invitación queda disponible hasta 7 días después del evento. Los invitados y sus respuestas se gestionan en «Invitados».
      </p>
    </div>
  )
}
