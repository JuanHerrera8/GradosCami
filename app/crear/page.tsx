'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { EditorEstudio } from '@/components/estudio/editor-estudio'
import { AsistenteCreacion } from '@/components/estudio/asistente-creacion'
import { EventoRepositorio } from '@/lib/storage'
import { DetalleEvento } from '@/types/invitation'

function Cargando({ texto }: { texto: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-sm font-medium text-slate-600 animate-pulse">{texto}</p>
    </div>
  )
}

function ContenidoCrear() {
  const searchParams = useSearchParams()
  const tokenEdicion = searchParams.get('editar')
  const [evento, setEvento] = useState<DetalleEvento | null>(null)
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'no_encontrado'>(tokenEdicion ? 'cargando' : 'listo')

  useEffect(() => {
    if (!tokenEdicion) {
      setEvento(null)
      setEstado('listo')
      return
    }
    setEstado('cargando')
    // Siempre partir de la versión guardada en la base de datos (la que ven los invitados)
    EventoRepositorio.obtenerPorTokenAdminAsync(tokenEdicion).then((encontrado) => {
      setEvento(encontrado)
      setEstado(encontrado ? 'listo' : 'no_encontrado')
    })
  }, [tokenEdicion])

  if (!tokenEdicion) return <AsistenteCreacion />
  if (estado === 'cargando') return <Cargando texto="Abriendo tu invitación…" />
  if (estado === 'no_encontrado' || !evento) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
        <p className="text-lg font-bold text-slate-900">No encontramos esta invitación</p>
        <p className="text-sm text-slate-600 max-w-sm">Revisa que el enlace de edición esté completo. Si el problema sigue, comunícate con el administrador.</p>
        <Link href="/crear" className="min-h-11 px-5 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center">
          Crear una invitación nueva
        </Link>
      </div>
    )
  }
  return <EditorEstudio key={evento.id} eventoInicial={evento} />
}

export default function PaginaCrear() {
  return (
    <Suspense fallback={<Cargando texto="Cargando…" />}>
      <ContenidoCrear />
    </Suspense>
  )
}
