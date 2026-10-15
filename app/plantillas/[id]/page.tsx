import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PLANTILLAS, eventoDesdePlantilla, obtenerPlantilla } from '@/lib/estudio/plantillas'
import { VistaPlantilla } from '@/components/plantillas/vista-plantilla'

// Se regenera a diario para que la fecha de ejemplo siga en el futuro
export const revalidate = 86400

export function generateStaticParams() {
  return PLANTILLAS.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const plantilla = obtenerPlantilla(id)
  if (!plantilla) return { title: 'Plantilla no encontrada — Tarjetón' }
  return {
    title: `${plantilla.nombre} · Plantilla de invitación — Tarjetón`,
    description: `${plantilla.descripcion}. Mira el ejemplo completo y úsalo para tu propia invitación digital.`,
    alternates: { canonical: `/plantillas/${plantilla.id}` },
    robots: { index: true, follow: true },
  }
}

export default async function PaginaPlantilla({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plantilla = obtenerPlantilla(id)
  if (!plantilla) notFound()

  // Se arma en el servidor para que la vista sea idéntica al hidratar (usa fechas e ids aleatorios)
  const evento = eventoDesdePlantilla(plantilla, {}, true)

  return <VistaPlantilla evento={evento} plantillaId={plantilla.id} nombre={plantilla.nombre} descripcion={plantilla.descripcion} />
}
