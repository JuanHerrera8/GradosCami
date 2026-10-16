import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield, Sparkles, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Quiénes Somos — Tarjetón (tarjeton.online)',
  description:
    'Conoce la historia, misión y tecnología de la plataforma de papelería digital protocolaria Tarjetón en tarjeton.online.',
}

export default function SobreNosotros() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-serif" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-8 text-sm text-slate-700 dark:text-slate-300">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline mb-2 font-sans"
        >
          <ArrowLeft size={14} /> Volver al inicio
        </Link>

        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-900 dark:text-white">
            Quiénes Somos
          </h1>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
            Transformando la papelería protocolaria y las convocatorias solemnes en experiencias digitales interactivas, sobrias y accesibles.
          </p>
        </div>

        <section className="space-y-4 leading-relaxed font-sans">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-serif">
            <Sparkles className="text-amber-600" size={20} />
            Nuestra Misión
          </h2>
          <p>
            <strong>Tarjetón</strong> (<span className="font-mono text-xs">https://www.tarjeton.online</span>) nació con el objetivo de resolver un problema recurrente en la organización de eventos y actos formales: la complejidad logística, el alto costo ecológico del papel físico y la lentitud para confirmar la asistencia de invitados a asambleas, galas de graduación, aniversarios corporativos y bodas de etiqueta.
          </p>
          <p>
            Desarrollamos una herramienta intuitiva que permite a cualquier anfitrión confeccionar invitaciones elegantes con sobres tridimensionales interactivos, sellos caligráficos, música ambiental, mapas de ubicación en tiempo real y confirmación directa e instantánea a través de WhatsApp, sin necesidad de registros obligatorios ni descargas de aplicaciones externas.
          </p>
        </section>

        <section className="space-y-4 leading-relaxed font-sans">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-serif">
            <Shield className="text-slate-900 dark:text-white" size={20} />
            Privacidad & Modelo Ético
          </h2>
          <p>
            Creemos firmemente en el respeto a la privacidad del usuario:
          </p>
          <ul className="space-y-2 pl-4 list-disc marker:text-slate-400">
            <li>
              <strong>Sin registros forzosos:</strong> No exigimos contraseñas ni recopilamos datos personales innecesarios para crear y compartir tarjetones.
            </li>
            <li>
              <strong>Pases nominales seguros:</strong> Cada invitado recibe un enlace privado individual para interactuar con la tarjeta y confirmar asistencia sin fricción.
            </li>
            <li>
              <strong>Financiación transparente:</strong> Ofrecemos un plan de cortesía generoso financiado mediante publicidad contextual de Google AdSense y un pase premium opcional de pago único para eventos de mayor escala que requieran cupos ilimitados y exclusión de publicidad.
            </li>
          </ul>
        </section>

        <section className="space-y-4 leading-relaxed font-sans">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-serif">
            <Users className="text-slate-900 dark:text-white" size={20} />
            Compromiso con la Calidad
          </h2>
          <p>
            Nuestro equipo técnico trabaja de manera continua actualizando diseños tipográficos, optimizando la velocidad de carga en dispositivos móviles y asegurando que las pasarelas de pago y las integraciones con WhatsApp funcionen con los más altos estándares de fiabilidad y seguridad.
          </p>
          <p>
            Si deseas conocer más sobre nuestra plataforma, tienes alguna sugerencia o requieres asistencia personalizada, no dudes en visitar nuestra página de{' '}
            <Link href="/contacto" className="text-slate-900 dark:text-white font-semibold underline underline-offset-4">
              Contacto y Soporte
            </Link>.
          </p>
        </section>
      </div>
    </main>
  )
}
