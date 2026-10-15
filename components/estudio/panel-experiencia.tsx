'use client'

import React from 'react'
import type { ConfiguracionVisual, ExperienciaInvitado, TipoApertura, TipoRecorrido } from '@/types/invitation'
import { experienciaDe } from '@/lib/estudio/kits'
import { Campo, Interruptor, TituloGrupo } from './ui'

const APERTURAS: { id: TipoApertura; nombre: string; descripcion: string }[] = [
  { id: 'sobre', nombre: 'Sobre con lacre', descripcion: 'Se abre al tocar el sello' },
  { id: 'telon', nombre: 'Telón', descripcion: 'Las cortinas se corren' },
  { id: 'raspa', nombre: 'Raspa y descubre', descripcion: 'Revela la fecha con el dedo' },
  { id: 'caja', nombre: 'Caja de regalo', descripcion: 'Ideal para cumpleaños' },
  { id: 'directo', nombre: 'Directo', descripcion: 'Sin animación' },
]

const RECORRIDOS: { id: TipoRecorrido; nombre: string; descripcion: string }[] = [
  { id: 'pagina', nombre: 'Una página', descripcion: 'Se baja con el dedo, como una web' },
  { id: 'historias', nombre: 'Historias', descripcion: 'Una pantalla a la vez, como Instagram' },
  { id: 'menu', nombre: 'Con menú', descripcion: 'Accesos rápidos a cada sección' },
]

export const PRESETS_MUSICA = [
  { id: 'canon', nombre: 'Canon en Re (Pachelbel)', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=pachelbel-canon-in-d-major-for-two-cellos-111005.mp3' },
  { id: 'piano', nombre: 'Vals romántico en piano', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=romantic-piano-10141.mp3' },
  { id: 'acustico', nombre: 'Guitarras acústicas', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf73458.mp3?filename=acoustic-guitars-ambient-uplifting-10820.mp3' },
  { id: 'jazz', nombre: 'Jazz lounge', url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f772dd.mp3?filename=smooth-waters-115977.mp3' },
]

interface PanelExperienciaProps {
  visual: ConfiguracionVisual
  alCambiar: (visual: ConfiguracionVisual) => void
  alProbarApertura: () => void
}

export function PanelExperiencia({ visual, alCambiar, alProbarApertura }: PanelExperienciaProps) {
  const exp = experienciaDe(visual)
  const setExp = (cambios: Partial<ExperienciaInvitado>) => alCambiar({ ...visual, experiencia: { ...exp, ...cambios }, animacionSobre: (cambios.apertura ?? exp.apertura) === 'sobre' })
  const musica = visual.musicaFondo || { activa: false, url: '', autoReproducir: true }
  const setMusica = (cambios: Partial<typeof musica>) => alCambiar({ ...visual, musicaFondo: { ...musica, ...cambios } })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <TituloGrupo>Cómo se abre</TituloGrupo>
          <button type="button" onClick={alProbarApertura} className="text-[13px] font-bold text-slate-900 underline underline-offset-2 cursor-pointer">
            Ver cómo se abre
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {APERTURAS.map((a) => {
            const activa = exp.apertura === a.id
            return (
              <button key={a.id} type="button" aria-pressed={activa} onClick={() => setExp({ apertura: a.id })} className={`flex flex-col items-start gap-0.5 p-3 rounded-xl text-left cursor-pointer ${activa ? 'border-2 border-amber-500 bg-amber-50' : 'border border-slate-200 bg-white hover:border-slate-300'}`}>
                <span className="text-[14px] font-bold text-slate-900">{a.nombre}</span>
                <span className="text-[12px] text-slate-500 leading-snug">{a.descripcion}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <TituloGrupo>Cómo se recorre</TituloGrupo>
        {RECORRIDOS.map((r) => {
          const activo = exp.recorrido === r.id
          return (
            <button key={r.id} type="button" aria-pressed={activo} onClick={() => setExp({ recorrido: r.id })} className={`flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer ${activo ? 'bg-amber-50 border-[1.5px] border-amber-400' : 'bg-white border-[1.5px] border-transparent hover:border-slate-200'}`}>
              <span className={`w-[18px] h-[18px] rounded-full shrink-0 box-border ${activo ? 'border-[6px] border-slate-900' : 'border-2 border-slate-400'}`} />
              <span className="flex flex-col gap-0.5">
                <span className="text-[14px] font-bold text-slate-900">{r.nombre}</span>
                <span className="text-[12px] text-slate-500">{r.descripcion}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3.5">
        <TituloGrupo>Detalles que encantan</TituloGrupo>
        <Interruptor etiqueta="Saludo con su nombre" descripcion="Y cuántos lugares tiene reservados" activo={exp.saludoPersonal} alCambiar={(v) => setExp({ saludoPersonal: v })} />
        <Interruptor etiqueta="Confeti al confirmar" descripcion="Una pequeña celebración" activo={exp.confetiAlConfirmar} alCambiar={(v) => setExp({ confetiAlConfirmar: v })} />
        <Interruptor etiqueta="Agregar al calendario" descripcion="Botón para Google y Apple" activo={exp.botonCalendario} alCambiar={(v) => setExp({ botonCalendario: v })} />
        <Interruptor etiqueta="Música de fondo" descripcion="Suena después de abrir la invitación" activo={musica.activa} alCambiar={(v) => setMusica({ activa: v, url: musica.url || PRESETS_MUSICA[0].url, titulo: musica.titulo || PRESETS_MUSICA[0].nombre })} />
        {musica.activa && (
          <div className="flex flex-col gap-2 pl-1">
            {PRESETS_MUSICA.map((p) => (
              <button key={p.id} type="button" aria-pressed={musica.url === p.url} onClick={() => setMusica({ url: p.url, titulo: p.nombre })} className={`min-h-10 px-3 rounded-xl text-left text-[13px] font-semibold cursor-pointer ${musica.url === p.url ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                {p.nombre}
              </button>
            ))}
            <Campo etiqueta="O pega el enlace de un MP3" tipo="url" valor={PRESETS_MUSICA.some((p) => p.url === musica.url) ? '' : musica.url} alCambiar={(v) => setMusica({ url: v, titulo: 'Nuestra canción' })} placeholder="https://…/cancion.mp3" />
          </div>
        )}
      </div>
    </div>
  )
}
