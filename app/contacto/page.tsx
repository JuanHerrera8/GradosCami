import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail, MessageCircle, Clock, ShieldCheck, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contacto y Soporte — InvitacionesYa / Tarjetón',
  description:
    'Canales oficiales de atención al cliente, asistencia técnica y consultas de InvitacionesYa y Tarjetón.',
}

export default function PaginaContacto() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-8 text-slate-700 dark:text-slate-300">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline mb-2"
        >
          <ArrowLeft size={14} /> Volver al inicio
        </Link>

        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-900 dark:text-white">
            Contacto & Atención al Cliente
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Estamos a tu disposición para ayudarte con la confección de tus invitaciones, consultas comerciales o incidencias técnicas.
          </p>
        </div>

        {/* Tarjetas de contacto directo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Mail size={18} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Correo Electrónico</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Para consultas de facturación, solicitudes de reembolso, soporte técnico o derechos de privacidad:
            </p>
            <a
              href="mailto:invitacionesya.web@gmail.com"
              className="inline-block text-sm font-bold text-slate-900 dark:text-white underline underline-offset-4 hover:text-slate-700"
            >
              invitacionesya.web@gmail.com
            </a>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <MessageCircle size={18} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Atención por WhatsApp</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Atención ágil para organizadores de eventos, activación de planes premium y dudas sobre pases:
            </p>
            <a
              href="https://wa.me/573000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-bold text-emerald-600 hover:text-emerald-700"
            >
              Línea de Asistencia Inmediata →
            </a>
          </div>
        </div>

        {/* Horarios y compromisos */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Información del Operador & Compromiso de Respuesta
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <Clock size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white">Tiempo de Respuesta</strong>
                <span className="text-slate-500">Menos de 24 horas hábiles por correo.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white">Garantía de Servicio</strong>
                <span className="text-slate-500">Soporte directo antes y durante la fecha del evento.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white">Operación</strong>
                <span className="text-slate-500">Servicio digital internacional en idioma español.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
