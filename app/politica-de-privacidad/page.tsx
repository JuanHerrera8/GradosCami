import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidad — InvitacionesYa / Tarjetón',
  description:
    'Política de privacidad, cookies y tratamiento de datos personales de la plataforma InvitacionesYa y Tarjetón.',
}

export default function PoliticaPrivacidad() {
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
            Política de Privacidad y Cookies
          </h1>
          <p className="text-xs text-slate-400 mt-1">Última actualización: Septiembre 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Responsable del Tratamiento de Datos</h2>
          <p>
            El presente sitio web <strong>InvitacionesYa</strong> (accesible desde <span className="font-mono text-xs">https://invitacionesya.com</span> y con su editor de tarjetas <strong>Tarjetón</strong>) es gestionado de forma transparente para la confección y distribución de papelería digital de invitación. Para cualquier consulta sobre privacidad o el tratamiento de sus datos personales, puede contactar al responsable a través del correo oficial: <a href="mailto:invitacionesya.web@gmail.com" className="font-semibold underline">invitacionesya.web@gmail.com</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Información que recopilamos</h2>
          <p>
            En InvitacionesYa priorizamos la mínima recopilación de datos y la privacidad del usuario:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 marker:text-slate-400">
            <li>
              <strong>Sin registro obligatorio:</strong> Los usuarios no necesitan crear cuentas ni almacenar contraseñas en nuestro servidor para diseñar sus tarjetas de invitación.
            </li>
            <li>
              <strong>Datos del evento:</strong> Recopilamos únicamente los datos que el usuario decide proporcionar para la confección del tarjetón: título del evento, fecha, lugar, música elegida, número de WhatsApp para confirmaciones y los nombres de los invitados para generar sus pases individuales.
            </li>
            <li>
              <strong>Datos de confirmación RSVP:</strong> Cuando un invitado confirma asistencia mediante el enlace privado, se registra su estado de confirmación (asiste / no asiste) y número de pases asignados.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Finalidad del Uso de la Información</h2>
          <p>
            La información ingresada se utiliza exclusivamente para:
          </p>
          <ul className="list-disc pl-5 space-y-1 marker:text-slate-400">
            <li>Generar las tarjetas visuales de invitación y permitir la interacción de los invitados.</li>
            <li>Facilitar la confirmación de asistencia directa al organizador vía WhatsApp.</li>
            <li>Procesar de forma segura pagos únicos para la activación del plan premium opcional.</li>
          </ul>
          <p>
            No vendemos, alquilamos ni compartimos datos personales con terceras partes para fines de telemarketing o venta comercial directa.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Publicidad y Cookies de Google (Google AdSense)</h2>
          <p>
            Este sitio web utiliza <strong>Google AdSense</strong>, un servicio publicitario prestado por Google LLC (&quot;Google&quot;), para mostrar anuncios contextualmente relevantes y financiar el acceso al plan gratuito de la plataforma.
          </p>
          <p>
            En cumplimiento de las directrices y políticas oficiales de Google para editores:
          </p>
          <ul className="list-disc pl-5 space-y-2 marker:text-slate-400">
            <li>
              Google y otros proveedores de tecnología publicitaria externos utilizan cookies para publicar anuncios basados en las visitas anteriores de los usuarios a este sitio web o a otros sitios web de Internet.
            </li>
            <li>
              El uso de cookies publicitarias permite a Google y a sus socios mostrar anuncios basados en las visitas realizadas a este y a otros sitios web.
            </li>
            <li>
              Los usuarios pueden inhabilitar la publicidad personalizada en cualquier momento ingresando a la{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline text-slate-900 dark:text-white"
              >
                Configuración de anuncios de Google
              </a>.
            </li>
            <li>
              Alternativamente, los usuarios pueden optar por no recibir cookies de proveedores externos para la publicidad personalizada visitando{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline text-slate-900 dark:text-white"
              >
                www.aboutads.info
              </a>{' '}
              o la plataforma europea{' '}
              <a
                href="https://www.youronlinechoices.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline text-slate-900 dark:text-white"
              >
                Your Online Choices
              </a>.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Ciclo de Vida, Retención y Eliminación</h2>
          <p>
            Los eventos y enlaces generados en el plan gratuito cuentan con un ciclo de vida programado que expira 7 días después de cumplida la fecha del evento configurada por el organizador. Una vez cumplido dicho periodo, los datos del evento se depuran de nuestros registros.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. Derechos del Usuario (ARCO)</h2>
          <p>
            Usted tiene derecho a solicitar el acceso, rectificación o eliminación total anticipada de los datos vinculados a su evento o invitación en cualquier momento. Para ejercer estos derechos, puede escribir a <a href="mailto:invitacionesya.web@gmail.com" className="font-semibold underline">invitacionesya.web@gmail.com</a> indicando el enlace o token de su evento, y su solicitud será atendida en un plazo máximo de 48 horas hábiles.
          </p>
        </section>
      </div>
    </main>
  )
}
