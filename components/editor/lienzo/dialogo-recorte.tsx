'use client'

import React, { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface DialogoRecorteProps {
  url: string | null
  alCancelar: () => void
  /** Devuelve la imagen recortada (data URL) y su proporción alto/ancho */
  alConfirmar: (dataUrl: string, proporcion: number) => Promise<void>
}

const PROPORCIONES: { id: string; nombre: string; valor: number | undefined }[] = [
  { id: 'libre', nombre: 'Original', valor: undefined },
  { id: '1:1', nombre: 'Cuadrada', valor: 1 },
  { id: '4:5', nombre: 'Retrato', valor: 4 / 5 },
  { id: '3:4', nombre: '3:4', valor: 3 / 4 },
  { id: '16:9', nombre: 'Panorámica', valor: 16 / 9 },
  { id: '9:16', nombre: 'Historia', valor: 9 / 16 },
]

function cargarImagen(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

async function recortar(url: string, area: Area): Promise<string> {
  const img = await cargarImagen(url)
  const escala = Math.min(1, 1600 / Math.max(area.width, area.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(area.width * escala)
  canvas.height = Math.round(area.height * escala)
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.88)
}

export function DialogoRecorte({ url, alCancelar, alConfirmar }: DialogoRecorteProps) {
  const [recorte, setRecorte] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [proporcion, setProporcion] = useState<number | undefined>(undefined)
  const [proporcionOriginal, setProporcionOriginal] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const alCompletar = useCallback((_: Area, pixeles: Area) => setArea(pixeles), [])

  const confirmar = async () => {
    if (!url || !area) return
    setProcesando(true)
    setError(null)
    try {
      const dataUrl = await recortar(url, area)
      await alConfirmar(dataUrl, area.height / area.width)
      setZoom(1)
      setRecorte({ x: 0, y: 0 })
    } catch {
      setError('No se pudo recortar esta imagen (el sitio de origen no lo permite). Sube la foto desde tu dispositivo.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <Dialog open={Boolean(url)} onOpenChange={(abrir) => !abrir && !procesando && alCancelar()}>
      <DialogContent className="max-w-lg w-[calc(100vw-1.5rem)] p-0 overflow-hidden gap-0" showCloseButton={false}>
        <DialogTitle className="px-4 pt-4 pb-2 text-base">Recortar foto</DialogTitle>
        <div className="relative w-full h-[min(60vh,420px)] bg-slate-900">
          {url && (
            <Cropper
              image={url}
              crop={recorte}
              zoom={zoom}
              aspect={proporcion ?? proporcionOriginal}
              onCropChange={setRecorte}
              onZoomChange={setZoom}
              onCropComplete={alCompletar}
              onMediaLoaded={(m) => setProporcionOriginal(m.naturalWidth / m.naturalHeight)}
              showGrid
              objectFit="contain"
            />
          )}
        </div>
        <div className="p-4 space-y-3">
          <div className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {PROPORCIONES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProporcion(p.valor)}
                className={`h-8 px-3 rounded-full text-xs font-bold shrink-0 cursor-pointer ${
                  proporcion === p.valor ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.nombre}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 text-xs font-semibold text-slate-600">
            Zoom
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-amber-500"
            />
          </label>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={alCancelar} disabled={procesando} className="h-10 px-4 rounded-xl border border-slate-300 text-sm font-semibold hover:bg-slate-50 cursor-pointer">
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmar}
              disabled={procesando || !area}
              className="h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 text-sm font-bold flex items-center gap-2 cursor-pointer"
            >
              {procesando && <Loader2 size={15} className="animate-spin" />}
              Aplicar recorte
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
