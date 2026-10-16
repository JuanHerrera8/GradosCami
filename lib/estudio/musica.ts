/**
 * Música de fondo: el anfitrión puede elegir una canción de la biblioteca, subir su propio archivo
 * o pegar un enlace de YouTube o Spotify. Aquí se reconoce qué tipo de enlace es.
 */

export type FuenteMusica =
  | { tipo: 'audio'; url: string }
  | { tipo: 'youtube'; id: string; inicio?: number }
  | { tipo: 'spotify'; embed: string }

const ID_YOUTUBE = /^[\w-]{11}$/

function segundos(t: string | null): number | undefined {
  if (!t) return undefined
  if (/^\d+$/.test(t)) return Number(t)
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
  if (!m) return undefined
  const total = Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0)
  return total || undefined
}

/** Reconoce un enlace de YouTube, Spotify o un archivo de audio. Devuelve null si no se puede reproducir. */
export function analizarMusica(enlace: string | undefined): FuenteMusica | null {
  const texto = (enlace || '').trim()
  if (!texto) return null

  // spotify:track:ID
  const uri = texto.match(/^spotify:(track|album|playlist|episode|show):([A-Za-z0-9]+)$/)
  if (uri) return { tipo: 'spotify', embed: `https://open.spotify.com/embed/${uri[1]}/${uri[2]}` }

  let url: URL
  try {
    url = new URL(texto)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.replace(/^(www|m|music)\./, '')

  if (host === 'youtu.be' || host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const partes = url.pathname.split('/').filter(Boolean)
    const id =
      host === 'youtu.be'
        ? partes[0]
        : url.searchParams.get('v') || (['shorts', 'embed', 'live', 'v'].includes(partes[0]) ? partes[1] : undefined)
    if (!id || !ID_YOUTUBE.test(id)) return null
    return { tipo: 'youtube', id, inicio: segundos(url.searchParams.get('t') || url.searchParams.get('start')) }
  }

  if (host === 'open.spotify.com') {
    // /track/ID, /intl-es/track/ID, /embed/track/ID
    const partes = url.pathname.split('/').filter((p) => p && !p.startsWith('intl-') && p !== 'embed')
    const [clase, id] = partes
    if (!['track', 'album', 'playlist', 'episode', 'show'].includes(clase) || !id || !/^[A-Za-z0-9]+$/.test(id)) return null
    return { tipo: 'spotify', embed: `https://open.spotify.com/embed/${clase}/${id}` }
  }

  // Cualquier otro enlace se intenta como archivo de audio (MP3 subido o enlazado)
  if (url.protocol === 'https:') return { tipo: 'audio', url: url.toString() }
  return null
}

/** Mensaje para el anfitrión cuando pega un enlace que no se puede usar */
export function problemaEnlaceMusica(enlace: string): string | null {
  const texto = enlace.trim()
  if (!texto) return null
  if (/spotify\.link|spoti\.fi/i.test(texto)) return 'Ese es un enlace corto de Spotify. Ábrelo y copia el enlace que empieza por open.spotify.com.'
  if (!analizarMusica(texto)) return 'No reconocemos ese enlace. Pega un enlace de YouTube, de Spotify o de un archivo MP3 (https://…).'
  return null
}

export const TIPOS_AUDIO_PERMITIDOS: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/ogg': 'ogg',
  'audio/webm': 'webm',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
}

export const TAMANO_MAXIMO_AUDIO = 15 * 1024 * 1024
