import type {
  DetalleEvento,
  ElementoItinerario,
  NombreIcono,
  SeccionModular,
  TipoEvento,
  TipoSeccion,
} from '@/types/invitation'
import { generarSlug, generarTokenAdmin } from '@/lib/event-utils'
import { KIT_POR_DEFECTO, obtenerKit, visualDesdeKit } from './kits'

/**
 * Información de cada tipo de evento: tono, textos y bloques que tienen sentido para él.
 * Es lo que hace que la invitación se adapte al evento que se celebra.
 */
export interface InfoEvento {
  id: TipoEvento
  nombre: string
  descripcion: string
  icono: NombreIcono
  kicker: string
  ejemploNombres: string
  etiquetaNombres: string
  kitSugerido: string
  rsvp: { pregunta: string; botonSi: string; botonNo: string; cta: string }
  /** Bloques que se ofrecen como "Sugeridos para…" en el editor */
  sugeridos: TipoSeccion[]
}

export const EVENTOS_INFO: InfoEvento[] = [
  {
    id: 'boda',
    nombre: 'Boda',
    descripcion: 'Ceremonia y fiesta',
    icono: 'heart',
    kicker: '¡Nos casamos!',
    ejemploNombres: 'Valentina & Andrés',
    etiquetaNombres: 'Nombres de los novios',
    kitSugerido: 'jardin',
    rsvp: { pregunta: '¿Nos acompañan?', botonSi: '¡Sí, ahí estaremos!', botonNo: 'No podremos ir', cta: 'Confirmar asistencia' },
    sugeridos: ['padrinos', 'hospedaje', 'playlist', 'galeria_fotos', 'lista_regalos'],
  },
  {
    id: 'quince_anos',
    nombre: 'XV años',
    descripcion: 'Vals, fiesta y padrinos',
    icono: 'crown',
    kicker: 'Mis XV años',
    ejemploNombres: 'Isabella',
    etiquetaNombres: 'Nombre de la quinceañera',
    kitSugerido: 'jardin',
    rsvp: { pregunta: '¿Me acompañas?', botonSi: '¡Claro que sí!', botonNo: 'No podré ir', cta: 'Confirmar asistencia' },
    sugeridos: ['playlist', 'galeria_fotos', 'lista_regalos', 'hospedaje'],
  },
  {
    id: 'cumpleanos_infantil',
    nombre: 'Cumpleaños infantil',
    descripcion: 'Niñas y niños',
    icono: 'partyPopper',
    kicker: '¡Ven a mi fiesta!',
    ejemploNombres: 'Mis 5 años · Emilia',
    etiquetaNombres: 'Nombre y edad del cumpleañero',
    kitSugerido: 'princesa',
    rsvp: { pregunta: '¿Vienes a mi fiesta?', botonSi: '¡Sí, voy!', botonNo: 'No puedo ir', cta: '¡Voy a la fiesta!' },
    sugeridos: ['lista_regalos', 'juego_adivinar', 'galeria_fotos', 'codigo_vestimenta'],
  },
  {
    id: 'cumpleanos',
    nombre: 'Cumpleaños',
    descripcion: 'Jóvenes y adultos',
    icono: 'cake',
    kicker: '¡Vamos a celebrar!',
    ejemploNombres: 'Los 30 de Mateo',
    etiquetaNombres: '¿Quién cumple?',
    kitSugerido: 'pop',
    rsvp: { pregunta: '¿Te apuntas?', botonSi: '¡Cuenta conmigo!', botonNo: 'Esta vez no puedo', cta: '¡Cuenta conmigo!' },
    sugeridos: ['galeria_fotos', 'juego_adivinar', 'lista_regalos', 'boton_enlace'],
  },
  {
    id: 'baby_shower',
    nombre: 'Baby shower',
    descripcion: 'Bienvenida al bebé',
    icono: 'baby',
    kicker: 'Baby shower',
    ejemploNombres: 'Bebé Emma',
    etiquetaNombres: 'Nombre del bebé o la familia',
    kitSugerido: 'nube',
    rsvp: { pregunta: '¿Nos acompañas?', botonSi: '¡Ahí estaré!', botonNo: 'No podré ir', cta: 'Confirmar asistencia' },
    sugeridos: ['galeria_fotos', 'playlist', 'vaca_regalo', 'mensaje_libre'],
  },
  {
    id: 'revelacion_genero',
    nombre: 'Revelación',
    descripcion: '¿Niño o niña?',
    icono: 'gift',
    kicker: '¿Niño o niña?',
    ejemploNombres: 'Familia Gómez Ruiz',
    etiquetaNombres: 'Nombre de la familia',
    kitSugerido: 'revelacion',
    rsvp: { pregunta: '¿Nos acompañas a descubrirlo?', botonSi: '¡Ahí estaré!', botonNo: 'No podré ir', cta: 'Confirmar asistencia' },
    sugeridos: ['lista_regalos', 'galeria_fotos', 'playlist'],
  },
  {
    id: 'grado',
    nombre: 'Grado',
    descripcion: 'Ceremonia y celebración',
    icono: 'award',
    kicker: '¡Me gradué!',
    ejemploNombres: 'Camila Rodríguez',
    etiquetaNombres: 'Nombre del graduado',
    kitSugerido: 'toga',
    rsvp: { pregunta: '¿Me acompañas?', botonSi: '¡Ahí estaré!', botonNo: 'No podré ir', cta: 'Confirmar asistencia' },
    sugeridos: ['galeria_fotos', 'codigo_vestimenta', 'playlist', 'vaca_regalo'],
  },
  {
    id: 'bautizo',
    nombre: 'Bautizo',
    descripcion: 'Ceremonia y recepción',
    icono: 'sun',
    kicker: 'Mi bautizo',
    ejemploNombres: 'Martín',
    etiquetaNombres: 'Nombre del bebé',
    kitSugerido: 'nube',
    rsvp: { pregunta: '¿Nos acompañas?', botonSi: '¡Ahí estaré!', botonNo: 'No podré ir', cta: 'Confirmar asistencia' },
    sugeridos: ['galeria_fotos', 'lista_regalos', 'mensaje_libre'],
  },
  {
    id: 'primera_comunion',
    nombre: 'Primera comunión',
    descripcion: 'Ceremonia y celebración',
    icono: 'church',
    kicker: 'Mi primera comunión',
    ejemploNombres: 'Valentina',
    etiquetaNombres: 'Nombre de quien hace la comunión',
    kitSugerido: 'comunion',
    rsvp: { pregunta: '¿Me acompañas?', botonSi: '¡Ahí estaré!', botonNo: 'No podré ir', cta: 'Confirmar asistencia' },
    sugeridos: ['galeria_fotos', 'lista_regalos', 'codigo_vestimenta'],
  },
  {
    id: 'despedida_soltera',
    nombre: 'Despedida',
    descripcion: 'De soltera o soltero',
    icono: 'cocktail',
    kicker: 'Última noche de soltera',
    ejemploNombres: 'Despedida de Daniela',
    etiquetaNombres: 'Nombre de la despedida',
    kitSugerido: 'despedida',
    rsvp: { pregunta: '¿Te apuntas?', botonSi: '¡Cuenta conmigo!', botonNo: 'Esta vez no puedo', cta: '¡Me apunto!' },
    sugeridos: ['galeria_fotos', 'juego_adivinar', 'hospedaje'],
  },
  {
    id: 'aniversario',
    nombre: 'Aniversario',
    descripcion: 'Bodas de plata, oro…',
    icono: 'ring',
    kicker: 'Celebramos nuestro amor',
    ejemploNombres: 'Rosa & Jorge',
    etiquetaNombres: 'Nombres de la pareja',
    kitSugerido: 'esmeralda',
    rsvp: { pregunta: '¿Nos acompañas?', botonSi: '¡Ahí estaré!', botonNo: 'No podré ir', cta: 'Confirmar asistencia' },
    sugeridos: ['playlist', 'mensaje_libre', 'codigo_vestimenta'],
  },
  {
    id: 'paseo',
    nombre: 'Paseos y salidas',
    descripcion: 'Finca, río, playa, asado',
    icono: 'sun',
    kicker: '¡Nos vamos de paseo!',
    ejemploNombres: 'Paseo de olla al río',
    etiquetaNombres: 'Nombre del plan',
    kitSugerido: 'paseo_rio',
    rsvp: { pregunta: '¿Te apuntas al plan?', botonSi: '¡Me apunto!', botonNo: 'Esta vez no', cta: '¡Me apunto!' },
    sugeridos: ['playlist', 'galeria_fotos', 'hospedaje'],
  },
  {
    id: 'navidad',
    nombre: 'Novena y fin de año',
    descripcion: 'Diciembre en familia o empresa',
    icono: 'tree',
    kicker: 'Novena de aguinaldos',
    ejemploNombres: 'Familia Rodríguez',
    etiquetaNombres: 'Quiénes invitan',
    kitSugerido: 'novena',
    rsvp: { pregunta: '¿Nos acompañas?', botonSi: '¡Ahí estaré!', botonNo: 'No podré ir', cta: 'Confirmar asistencia' },
    sugeridos: ['playlist', 'lista_regalos', 'galeria_fotos'],
  },
  {
    id: 'amor_amistad',
    nombre: 'Amor y amistad',
    descripcion: 'Amigo secreto',
    icono: 'heart',
    kicker: 'Amigo secreto',
    ejemploNombres: 'Amor y amistad 2026',
    etiquetaNombres: 'Nombre del encuentro',
    kitSugerido: 'amor_amistad',
    rsvp: { pregunta: '¿Te apuntas?', botonSi: '¡Me apunto!', botonNo: 'Esta vez no', cta: '¡Me apunto!' },
    sugeridos: ['playlist', 'galeria_fotos', 'juego_adivinar'],
  },
  {
    id: 'disfraces',
    nombre: 'Fiesta de disfraces',
    descripcion: 'Halloween y temáticas',
    icono: 'moon',
    kicker: 'Fiesta de disfraces',
    ejemploNombres: 'Noche de brujas',
    etiquetaNombres: 'Nombre de la fiesta',
    kitSugerido: 'disfraces',
    rsvp: { pregunta: '¿Te apuntas?', botonSi: '¡Ahí estaré disfrazado!', botonNo: 'Esta vez no', cta: '¡Me apunto!' },
    sugeridos: ['juego_adivinar', 'galeria_fotos', 'vaca_regalo'],
  },
  {
    id: 'corporativo',
    nombre: 'Empresa',
    descripcion: 'Lanzamientos, foros y cenas',
    icono: 'building',
    kicker: 'Te invitamos',
    ejemploNombres: 'Lanzamiento 2027',
    etiquetaNombres: 'Nombre del evento',
    kitSugerido: 'protocolo',
    rsvp: { pregunta: '¿Asistirás?', botonSi: 'Sí, asistiré', botonNo: 'No podré asistir', cta: 'Registrar asistencia' },
    sugeridos: ['codigo_vestimenta', 'hospedaje', 'boton_enlace', 'galeria_fotos'],
  },
  {
    id: 'otro',
    nombre: 'Otro',
    descripcion: 'Lo que quieras celebrar',
    icono: 'sparkles',
    kicker: 'Celebremos',
    ejemploNombres: 'Nuestra reunión',
    etiquetaNombres: 'Nombre del evento',
    kitSugerido: 'minimal',
    rsvp: { pregunta: '¿Nos acompañas?', botonSi: '¡Ahí estaré!', botonNo: 'No podré ir', cta: 'Confirmar asistencia' },
    sugeridos: ['galeria_fotos', 'playlist', 'codigo_vestimenta', 'boton_enlace'],
  },
]

export function infoEvento(tipo?: TipoEvento): InfoEvento {
  return EVENTOS_INFO.find((e) => e.id === tipo) || EVENTOS_INFO[EVENTOS_INFO.length - 1]
}

/** '17:00' → '5:00 p. m.' */
export function formatearHora(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h)) return hhmm
  const sufijo = h >= 12 ? 'p. m.' : 'a. m.'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m || 0).padStart(2, '0')} ${sufijo}`
}

function sumarHoras(hhmm: string, horas: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = ((h + horas) % 24 + 24) % 24
  return `${String(total).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`
}

function idSeccion(tipo: TipoSeccion): string {
  return `sec-${tipo}-${Math.random().toString(36).slice(2, 8)}`
}

function idItem(prefijo: string): string {
  return `${prefijo}-${Math.random().toString(36).slice(2, 8)}`
}

function seccion(
  tipo: TipoSeccion,
  titulo: string,
  subtitulo: string,
  datos: SeccionModular['datos'] = {},
  icono?: NombreIcono
): SeccionModular {
  return { id: idSeccion(tipo), tipo, titulo, subtitulo, visible: true, orden: 0, datos, icono }
}

function hito(hora: string, titulo: string, descripcion = ''): ElementoItinerario {
  return { id: idItem('it'), hora: formatearHora(hora), titulo, descripcion }
}

export interface DatosIniciales {
  tipo: TipoEvento
  nombres: string
  fecha: string // YYYY-MM-DD
  hora: string // HH:mm
  lugar: string
  kitId?: string
}

/** Título del evento (se usa en el enlace, en WhatsApp y en la vista previa al compartir) */
export function tituloEvento(tipo: TipoEvento, nombres: string): string {
  const n = nombres.trim()
  switch (tipo) {
    case 'boda':
      return `Boda de ${n}`
    case 'quince_anos':
      return `XV años de ${n}`
    case 'cumpleanos':
      return /cumple|años|\d/i.test(n) ? n : `Cumpleaños de ${n}`
    case 'baby_shower':
      return `Baby shower de ${n}`
    case 'grado':
      return `Grado de ${n}`
    case 'bautizo':
      return `Bautizo de ${n}`
    case 'primera_comunion':
      return `Primera comunión de ${n}`
    case 'cumpleanos_infantil':
      return /cumple|años|\d/i.test(n) ? `Cumpleaños: ${n}` : `Cumpleaños de ${n}`
    case 'revelacion_genero':
      return `Revelación de género · ${n}`
    case 'aniversario':
      return `Aniversario de ${n}`
    default:
      return n
  }
}

/** Bloques iniciales de la invitación según el tipo de evento */
export function generarSeccionesParaEvento(d: DatosIniciales): SeccionModular[] {
  const info = infoEvento(d.tipo)
  const portada = seccion('cabecera', d.nombres, info.kicker, { mostrarFotoRetrato: false, mostrarBadge: false })
  const cuenta = (titulo: string) => seccion('cuenta_regresiva', titulo, '', {}, 'clock')
  const rsvp = seccion('confirmacion_rsvp', info.rsvp.pregunta, '', { textoBoton: info.rsvp.cta, metodoConfirmacion: 'tarjeton' }, 'check')
  const lugar = (titulo: string, subtitulo = '') =>
    seccion('ubicacion', titulo, subtitulo, { nombreLugar: d.lugar, direccion: '', detallesAcceso: '' }, 'mapPin')
  const vestimenta = (etiqueta: string, nota = '') =>
    seccion('codigo_vestimenta', 'Código de vestimenta', '', { etiqueta, notasVestimenta: nota, coloresSugeridos: [] }, 'shirt')
  const sobres = seccion(
    'regalos_bancarios',
    'Lluvia de sobres',
    'Tu presencia es nuestro mejor regalo. Si quieres tener un detalle, puedes hacerlo aquí:',
    { tipoRegalo: 'transferencia', banco: '', tipoCuenta: '', numeroCuenta: '', titular: '' },
    'gift'
  )

  let bloques: SeccionModular[] = []
  switch (d.tipo) {
    case 'boda':
      bloques = [
        portada,
        cuenta('Falta muy poco'),
        seccion('historia', 'Nuestra historia', '', { cuerpoTexto: '' }, 'heart'),
        seccion('itinerario', 'Ceremonia y fiesta', '', {
          itinerario: [hito(d.hora, 'Ceremonia'), hito(sumarHoras(d.hora, 2), 'Fiesta')],
          nombreLugar: d.lugar,
          direccion: '',
        }, 'calendar'),
        vestimenta('Formal'),
        sobres,
        rsvp,
      ]
      break
    case 'quince_anos':
      bloques = [
        portada,
        cuenta('Falta muy poco'),
        seccion('historia', 'Mis 15 años', '', { cuerpoTexto: '' }, 'crown'),
        seccion('padrinos', 'Mis padrinos', '', { personas: [] }, 'users'),
        seccion('itinerario', 'La fiesta', '', {
          itinerario: [hito(d.hora, 'Recepción'), hito(sumarHoras(d.hora, 1), 'Vals'), hito(sumarHoras(d.hora, 2), 'Fiesta')],
          nombreLugar: d.lugar,
          direccion: '',
        }, 'music'),
        vestimenta('Gala'),
        sobres,
        rsvp,
      ]
      break
    case 'cumpleanos':
      bloques = [
        portada,
        cuenta('Cuenta regresiva para la fiesta'),
        lugar('La fiesta'),
        vestimenta('Casual'),
        seccion('playlist', 'Playlist de la noche', 'Agrega la canción que no puede faltar.', { canciones: [] }, 'music'),
        seccion('vaca_regalo', 'Vaca para el regalo', 'Entre todos le damos un regalo especial.', { metaVaca: 0, recaudadoVaca: 0, medioPagoVaca: '' }, 'gift'),
        rsvp,
      ]
      break
    case 'baby_shower':
      bloques = [
        portada,
        cuenta('Falta muy poco'),
        lugar('Lugar y hora'),
        seccion('lista_regalos', 'Lista de regalos', 'Reserva uno para que nadie repita.', {
          regalos: [
            { id: idItem('rg'), nombre: 'Pañales etapa 1' },
            { id: idItem('rg'), nombre: 'Pañitos húmedos' },
            { id: idItem('rg'), nombre: 'Body de algodón' },
          ],
        }, 'gift'),
        seccion('juego_adivinar', 'Juego', '', {
          pregunta: '¿Cuánto pesará al nacer?',
          opcionesJuego: [
            { id: idItem('op'), texto: '2,8 kg', votos: 0 },
            { id: idItem('op'), texto: '3,2 kg', votos: 0 },
            { id: idItem('op'), texto: '3,6 kg', votos: 0 },
          ],
        }, 'star'),
        rsvp,
      ]
      break
    case 'grado':
      bloques = [
        portada,
        cuenta('Falta muy poco'),
        seccion('itinerario', 'Ceremonia y celebración', '', {
          itinerario: [hito(d.hora, 'Ceremonia de grado'), hito(sumarHoras(d.hora, 3), 'Celebración')],
          nombreLugar: d.lugar,
          direccion: '',
        }, 'award'),
        seccion('historia', 'Mi camino', '', { cuerpoTexto: '' }, 'award'),
        rsvp,
      ]
      break
    case 'bautizo':
      bloques = [
        portada,
        cuenta('Falta muy poco'),
        seccion('itinerario', 'Ceremonia y recepción', '', {
          itinerario: [hito(d.hora, 'Ceremonia religiosa'), hito(sumarHoras(d.hora, 1), 'Recepción')],
          nombreLugar: d.lugar,
          direccion: '',
        }, 'church'),
        seccion('padrinos', 'Mis padrinos', '', { personas: [] }, 'users'),
        rsvp,
      ]
      break
    case 'corporativo':
      bloques = [
        portada,
        seccion('itinerario', 'Agenda', '', {
          itinerario: [hito(d.hora, 'Registro'), hito(sumarHoras(d.hora, 1), 'Apertura'), hito(sumarHoras(d.hora, 2), 'Cóctel')],
          nombreLugar: d.lugar,
          direccion: '',
        }, 'calendar'),
        seccion('padrinos', 'Ponentes', '', { personas: [] }, 'users'),
        lugar('Ubicación'),
        vestimenta('Formal'),
        rsvp,
      ]
      break
    case 'cumpleanos_infantil':
      bloques = [
        portada,
        cuenta('¡Falta poquito!'),
        lugar('La fiesta'),
        seccion('itinerario', 'Programa', '', {
          itinerario: [hito(d.hora, 'Llegada y juegos'), hito(sumarHoras(d.hora, 1), 'Show y piñata'), hito(sumarHoras(d.hora, 2), 'Torta y sorpresas')],
        }, 'partyPopper'),
        vestimenta('Ropa cómoda para jugar'),
        seccion('lista_regalos', 'Ideas de regalo', 'Si quieres, reserva una para que nadie repita.', { regalos: [] }, 'gift'),
        rsvp,
      ]
      break
    case 'revelacion_genero':
      bloques = [
        portada,
        cuenta('Falta muy poco para saberlo'),
        lugar('Lugar'),
        seccion('juego_adivinar', 'Haz tu apuesta', '', {
          pregunta: '¿Niño o niña?',
          opcionesJuego: [
            { id: idItem('op'), texto: 'Niño', votos: 0 },
            { id: idItem('op'), texto: 'Niña', votos: 0 },
          ],
        }, 'star'),
        seccion('lista_regalos', 'Lista de regalos', 'Reserva uno para que nadie repita.', { regalos: [] }, 'gift'),
        rsvp,
      ]
      break
    case 'primera_comunion':
      bloques = [
        portada,
        cuenta('Falta muy poco'),
        seccion('itinerario', 'Ceremonia y celebración', '', {
          itinerario: [hito(d.hora, 'Eucaristía'), hito(sumarHoras(d.hora, 2), 'Celebración')],
          nombreLugar: d.lugar,
          direccion: '',
        }, 'church'),
        seccion('padrinos', 'Mis padrinos', '', { personas: [] }, 'users'),
        seccion('mensaje_libre', 'Un mensaje', '', { mensaje: '', autorMensaje: '' }, 'feather'),
        rsvp,
      ]
      break
    case 'despedida_soltera':
      bloques = [
        portada,
        cuenta('Cuenta regresiva'),
        seccion('itinerario', 'El plan', '', {
          itinerario: [hito(d.hora, 'Encuentro'), hito(sumarHoras(d.hora, 1), 'Cena'), hito(sumarHoras(d.hora, 3), '¡Rumba!')],
          nombreLugar: d.lugar,
          direccion: '',
        }, 'cocktail'),
        vestimenta('Todas de rosa'),
        seccion('vaca_regalo', 'Vaca de la despedida', 'Para el regalo y la sorpresa.', { metaVaca: 0, recaudadoVaca: 0, medioPagoVaca: '' }, 'wallet'),
        seccion('playlist', 'Playlist de la noche', 'Agrega la canción que no puede faltar.', { canciones: [] }, 'music'),
        rsvp,
      ]
      break
    case 'aniversario':
      bloques = [
        portada,
        cuenta('Falta muy poco'),
        seccion('historia', 'Nuestra historia', '', { cuerpoTexto: '' }, 'heart'),
        seccion('itinerario', 'La celebración', '', {
          itinerario: [hito(d.hora, 'Recepción'), hito(sumarHoras(d.hora, 1), 'Cena y brindis')],
          nombreLugar: d.lugar,
          direccion: '',
        }, 'wine'),
        seccion('galeria_fotos', 'Nuestros momentos', '', { fotos: [] }, 'camera'),
        rsvp,
      ]
      break
    case 'paseo':
      bloques = [
        portada,
        cuenta('Faltan'),
        seccion('itinerario', 'El plan', '', {
          itinerario: [hito(d.hora, 'Salida'), hito(sumarHoras(d.hora, 2), 'Llegada'), hito(sumarHoras(d.hora, 4), 'Almuerzo')],
        }, 'bus'),
        lugar('Punto de encuentro'),
        seccion('texto_libre', 'Qué llevar', '', { cuerpoTexto: 'Ropa cómoda, vestido de baño, bloqueador, toalla y muchas ganas de pasarla bien.', alineacionTexto: 'centro' }, 'shoppingBag'),
        seccion('vaca_regalo', 'Vaca del paseo', 'Para la comida y el transporte.', { metaVaca: 0, recaudadoVaca: 0, medioPagoVaca: '' }, 'wallet'),
        rsvp,
      ]
      break
    case 'navidad':
      bloques = [
        portada,
        cuenta('Falta muy poco'),
        lugar('Lugar'),
        seccion('itinerario', 'Programa', '', {
          itinerario: [hito(d.hora, 'Novena'), hito(sumarHoras(d.hora, 1), 'Natilla y buñuelos'), hito(sumarHoras(d.hora, 2), 'Intercambio de regalos')],
        }, 'tree'),
        seccion('playlist', 'Villancicos y canciones', 'Propón tu villancico favorito.', { canciones: [] }, 'music'),
        rsvp,
      ]
      break
    case 'amor_amistad':
      bloques = [
        portada,
        lugar('Lugar'),
        seccion('texto_libre', 'Reglas del amigo secreto', '', { cuerpoTexto: 'Trae un regalo para tu amigo secreto. ¡No le cuentes a nadie a quién te tocó!', alineacionTexto: 'centro' }, 'gift'),
        seccion('playlist', 'Playlist', 'Propón una canción.', { canciones: [] }, 'music'),
        rsvp,
      ]
      break
    case 'disfraces':
      bloques = [
        portada,
        cuenta('Cuenta regresiva'),
        lugar('La fiesta'),
        vestimenta('Ven disfrazado', 'Habrá premio al mejor disfraz.'),
        seccion('playlist', 'Playlist de la noche', 'Agrega la canción que no puede faltar.', { canciones: [] }, 'music'),
        rsvp,
      ]
      break
    default:
      bloques = [portada, cuenta('Falta muy poco'), lugar('Detalles'), rsvp]
  }

  return bloques.map((b, i) => ({ ...b, orden: i }))
}

/** Crea la invitación completa lista para guardar en la base de datos */
export function crearEventoInicial(d: DatosIniciales): DetalleEvento {
  const info = infoEvento(d.tipo)
  const kit = obtenerKit(d.kitId || info.kitSugerido) || KIT_POR_DEFECTO
  const nombres = d.nombres.trim() || info.ejemploNombres
  const titulo = tituloEvento(d.tipo, nombres)
  const fechaIso = `${d.fecha}T${d.hora || '18:00'}:00`
  const fechaEvento = new Date(fechaIso)
  const expira = new Date((Number.isNaN(fechaEvento.getTime()) ? Date.now() : fechaEvento.getTime()) + 7 * 24 * 60 * 60 * 1000)
  const secciones = generarSeccionesParaEvento({ ...d, nombres })

  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `ev-${Date.now()}`,
    tokenAdmin: generarTokenAdmin(),
    slugPublico: generarSlug(titulo),
    tipoEvento: d.tipo,
    titulo,
    subtitulo: info.kicker,
    anfitriones: nombres,
    fechaEvento: fechaIso,
    horaEvento: formatearHora(d.hora || '18:00'),
    direccion: d.lugar,
    enlaceMapa: d.lugar ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.lugar)}` : '',
    whatsappNumero: '',
    whatsappPlantilla: 'Hola, soy {invitado}. Confirmo mi asistencia a {evento} ({pases} persona(s)).',
    mostrarFotoRetrato: false,
    mostrarBadge: false,
    esPremium: false,
    metodoConfirmacion: 'tarjeton',
    creadoEn: new Date().toISOString(),
    expiraEn: expira.toISOString(),
    configuracionVisual: visualDesdeKit(kit),
    secciones,
  }
}
