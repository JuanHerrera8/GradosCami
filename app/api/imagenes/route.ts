import { NextRequest, NextResponse } from 'next/server'
import { obtenerClienteSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const BUCKET_MEDIOS = 'tarjeton-media'
const TAMANO_MAXIMO_BYTES = 6 * 1024 * 1024
// SVG excluido a propósito: puede contener scripts embebidos
const TIPOS_PERMITIDOS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function generarId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/**
 * POST /api/imagenes
 * Recibe una imagen (multipart, campo "archivo") y la guarda en Supabase Storage.
 * Devuelve la URL pública, que es la que se persiste en la base de datos del evento.
 * Si Storage no está disponible, devuelve la imagen como data URL para que igualmente
 * quede guardada dentro del registro del evento en la base de datos.
 */
export async function POST(req: NextRequest) {
  try {
    const formulario = await req.formData()
    const archivo = formulario.get('archivo')
    const carpetaCruda = String(formulario.get('carpeta') || 'general')
    const carpeta = carpetaCruda.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'general'

    if (!archivo || typeof archivo === 'string') {
      return NextResponse.json({ ok: false, error: 'No se recibió ninguna imagen.' }, { status: 400 })
    }

    const extension = TIPOS_PERMITIDOS[archivo.type]
    if (!extension) {
      return NextResponse.json(
        { ok: false, error: 'Formato no soportado. Use JPG, PNG, WEBP o GIF.' },
        { status: 415 }
      )
    }

    if (archivo.size > TAMANO_MAXIMO_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'La imagen supera el tamaño máximo de 6 MB.' },
        { status: 413 }
      )
    }

    const bytes = Buffer.from(await archivo.arrayBuffer())
    const supabase = obtenerClienteSupabase()

    if (supabase) {
      const ruta = `${carpeta}/${generarId()}.${extension}`
      let { error } = await supabase.storage
        .from(BUCKET_MEDIOS)
        .upload(ruta, bytes, { contentType: archivo.type, cacheControl: '31536000', upsert: false })

      // Primer uso: crear el bucket público si la llave de servicio lo permite
      if (error && /not found/i.test(error.message)) {
        await supabase.storage.createBucket(BUCKET_MEDIOS, { public: true }).catch(() => null)
        ;({ error } = await supabase.storage
          .from(BUCKET_MEDIOS)
          .upload(ruta, bytes, { contentType: archivo.type, cacheControl: '31536000', upsert: false }))
      }

      if (!error) {
        const { data } = supabase.storage.from(BUCKET_MEDIOS).getPublicUrl(ruta)
        return NextResponse.json({ ok: true, url: data.publicUrl, almacenamiento: 'supabase_storage' })
      }

      console.warn('[api/imagenes] Storage no disponible, se usará data URL:', error.message)
    }

    const dataUrl = `data:${archivo.type};base64,${bytes.toString('base64')}`
    return NextResponse.json({ ok: true, url: dataUrl, almacenamiento: 'base64_en_registro' })
  } catch (err: any) {
    console.error('Error en POST /api/imagenes:', err)
    return NextResponse.json(
      { ok: false, error: 'No se pudo procesar la imagen.' },
      { status: 500 }
    )
  }
}
