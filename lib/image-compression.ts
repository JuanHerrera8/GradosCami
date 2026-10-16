/**
 * Utilidad de compresión y redimensionamiento de imágenes en el cliente (Browser Canvas).
 * Evita desbordar la cuota de localStorage (5MB) y asegura transferencias ultrarrápidas a la API.
 */
export async function comprimirImagen(
  archivo: File,
  maxDimension: number = 1280,
  calidad: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Si no es imagen, intentar leer directamente
    if (!archivo.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(archivo)
      return
    }

    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Redimensionar proporcionalmente si supera la dimensión máxima
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }

        // Suavizado de imagen de alta calidad
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir a JPEG comprimido de alta fidelidad
        const formato = archivo.type === 'image/png' && archivo.size < 800 * 1024 ? 'image/png' : 'image/jpeg'
        const base64Comprimido = canvas.toDataURL(formato, calidad)
        resolve(base64Comprimido)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(archivo)
  })
}

function dataUrlABlob(dataUrl: string): Blob {
  const [cabecera, datos] = dataUrl.split(',')
  const tipo = cabecera.match(/data:([^;]+)/)?.[1] || 'image/jpeg'
  const binario = atob(datos)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return new Blob([bytes], { type: tipo })
}

/**
 * Comprime una imagen en el navegador y la sube a Supabase Storage vía /api/imagenes.
 * Devuelve la URL pública que se guarda en la base de datos del evento.
 * Acepta un File o un data URL (por ejemplo, el resultado de un recorte).
 */
export async function subirImagen(
  origen: File | string,
  carpeta: string = 'general',
  maxDimension: number = 1600
): Promise<string> {
  const dataUrl = typeof origen === 'string' ? origen : await comprimirImagen(origen, maxDimension)

  try {
    const formulario = new FormData()
    const blob = dataUrlABlob(dataUrl)
    const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg'
    formulario.append('archivo', blob, `imagen.${extension}`)
    formulario.append('carpeta', carpeta)

    const respuesta = await fetch('/api/imagenes', { method: 'POST', body: formulario })
    const resultado = await respuesta.json()
    if (respuesta.ok && resultado?.url) return resultado.url as string
    throw new Error(resultado?.error || 'Error subiendo imagen')
  } catch (err) {
    console.warn('No se pudo subir la imagen al almacenamiento, se guardará embebida:', err)
    return dataUrl
  }
}
