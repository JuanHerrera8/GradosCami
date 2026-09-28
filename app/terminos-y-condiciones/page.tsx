import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — InvitacionesYa / Tarjetón',
  description:
    'Términos y condiciones de uso, políticas de pago y reembolsos de la plataforma InvitacionesYa y Tarjetón.',
}

export default function TerminosCondiciones() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline mb-2"
        >
          <ArrowLeft size={14} /> Volver al inicio
        </Link>

        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-900 dark:text-white">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-xs text-slate-400 mt-1">Última actualización: Septiembre 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Aceptación del Servicio</h2>
          <p>
            Al acceder y utilizar la plataforma <strong>InvitacionesYa</strong> (y su estudio de confección digital <strong>Tarjetón</strong>), usted acepta sujetarse a los presentes Términos y Condiciones, así como a nuestra Política de Privacidad. Si no está de acuerdo con alguno de los términos, debe abstenerse de utilizar el servicio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Descripción de los Planes y Tarifas</h2>
          <div className="space-y-2">
            <p>
              <strong>Plan de Cortesía (Gratuito):</strong> Permite confeccionar tarjetas interactivas de invitación con un límite de pases de cortesía por evento, financiado mediante anuncios contextuales provistos por redes publicitarias como Google AdSense.
            </p>
            <p>
              <strong>Pase Premium (Pago Único):</strong> Para eventos que requieran pases nominales ilimitados, eliminación total de publicidad y soporte prioritario, se ofrece la activación del pase premium mediante pasarelas de pago seguras (Mercado Pago / Wompi) a una tarifa única y transparente de $3.99 USD (~$15.900 COP).
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Entrega del Servicio Digital</h2>
          <p>
            Al tratarse de un software como servicio digital (SaaS), la activación de los beneficios del Pase Premium se ejecuta de forma automática e inmediata una vez la pasarela de pagos confirma la transacción satisfactoria.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Política de Reembolsos y Garantía de Satisfacción</h2>
          <p>
            Nos comprometemos con la satisfacción del usuario:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 marker:text-slate-400">
            <li>
              Si experimenta una falla técnica en la activación del Pase Premium o un cobro duplicado involuntario, realizaremos el reembolso íntegro del dinero o la activación manual del servicio de forma inmediata.
            </li>
            <li>
              Usted puede solicitar el reembolso dentro de los primeros 7 días posteriores al pago si el servicio no cumple con lo ofrecido y el evento no se ha celebrado aún.
            </li>
            <li>
              Para solicitar una revisión de reembolso, envíe un correo a <a href="mailto:invitacionesya.web@gmail.com" className="font-semibold underline">invitacionesya.web@gmail.com</a> con el identificador de su transacción.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Uso Responsable y Contenido Prohibido</h2>
          <p>
            Queda estrictamente prohibido utilizar la plataforma para difundir contenidos ilícitos, fraudulentos, difamatorios, de odio, pornografía no autorizada o que vulneren derechos de propiedad intelectual. Nos reservamos el derecho de deshabilitar cualquier evento que viole estas normas sin derecho a reembolso.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. Atención al Cliente</h2>
          <p>
            Cualquier duda, reclamación o consulta respecto a estos términos puede ser remitida a <a href="mailto:invitacionesya.web@gmail.com" className="font-semibold underline">invitacionesya.web@gmail.com</a> o a través de nuestra sección oficial de <Link href="/contacto" className="font-semibold underline">Contacto</Link>.
          </p>
        </section>
      </div>
    </main>
  )
}
