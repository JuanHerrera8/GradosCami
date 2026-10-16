import { NextRequest, NextResponse } from 'next/server'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { TAMANO_MAXIMO_AUDIO, TIPOS_AUDIO_PERMITIDOS } from '@/lib/estudio/musica'

export const dynamic = 'force-dynamic'

const BUCKET_AUDIO = 'tarjeton-audio'

/**
 * POST /api/audio
 * Prepara la subida de la canción de fondo del anfitrión a Supabase Storage.
 * Las canciones pesan más de lo que admite el cuerpo de una función del servidor, así que
 * aquí solo se valida al anfitrión y se entrega una URL firmada: el navegador sube el archivo
 * directo a Storage y en la base de datos queda solo la URL pública.
 */
export async function POST(req: NextRequest) {
  try {
    const { eventoId, tokenAdmin, tipo, tamano } = await req.json()

    const extension = TIPOS_AUDIO_PERMITIDOS[String(tipo)]
    if (!extension) {
      return NextResponse.json({ ok: false, error: 'Formato no soportado. Usa un archivo MP3, M4A, OGG o WAV.' }, { status: 415 })
    }
    if (!Number(tamano) || Number(tamano) > TAMANO_MAXIMO_AUDIO) {
      return NextResponse.json({ ok: false, error: 'La canción supera el tamaño máximo de 15 MB.' }, { status: 413 })
    }

    const supabase = obtenerClienteSupabase()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'El almacenamiento no está disponible. Usa un enlace de YouTube o Spotify.' }, { status: 503 })
    }

    const { data: evento } = await supabase.from('eventos').select('id, token_admin').eq('id', String(eventoId || '')).maybeSingle()
    if (!evento || typeof tokenAdmin !== 'string' || !tokenAdmin || tokenAdmin !== evento.token_admin) {
      return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 403 })
    }

    const ruta = `${evento.id}/${crypto.randomUUID()}.${extension}`
    let { data, error } = await supabase.storage.from(BUCKET_AUDIO).createSignedUploadUrl(ruta)

    // Primer uso: crear el bucket público si la llave de servicio lo permite
    if (error && /not found/i.test(error.message)) {
      await supabase.storage
        .createBucket(BUCKET_AUDIO, { public: true, fileSizeLimit: TAMANO_MAXIMO_AUDIO, allowedMimeTypes: Object.keys(TIPOS_AUDIO_PERMITIDOS) })
        .catch(() => null)
      ;({ data, error } = await supabase.storage.from(BUCKET_AUDIO).createSignedUploadUrl(ruta))
    }

    if (error || !data) {
      console.warn('[api/audio] No se pudo preparar la subida:', error?.message)
      return NextResponse.json({ ok: false, error: 'No se pudo preparar la subida. Usa un enlace de YouTube o Spotify mientras tanto.' }, { status: 503 })
    }

    const { data: publica } = supabase.storage.from(BUCKET_AUDIO).getPublicUrl(ruta)
    return NextResponse.json({ ok: true, bucket: BUCKET_AUDIO, ruta, token: data.token, url: publica.publicUrl })
  } catch (err) {
    console.error('Error en POST /api/audio:', err)
    return NextResponse.json({ ok: false, error: 'No se pudo procesar la canción.' }, { status: 500 })
  }
}
