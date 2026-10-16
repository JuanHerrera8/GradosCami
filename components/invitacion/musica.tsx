'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MusicaFondoConfig } from '@/types/invitation'
import { analizarMusica } from '@/lib/estudio/musica'

/**
 * Música de fondo de la invitación: un MP3 (de la biblioteca o subido por el anfitrión),
 * un video de YouTube (suena solo el audio) o una canción de Spotify (mini reproductor,
 * porque Spotify no permite reproducir sin que el invitado toque play).
 * Los navegadores bloquean el audio hasta que la persona toca la pantalla: `iniciar` se llama
 * al abrir la invitación, dentro de ese toque.
 */
export function useMusicaFondo(musica: MusicaFondoConfig | undefined, habilitada: boolean, contenida: boolean) {
  const fuente = useMemo(() => (habilitada && musica?.activa ? analizarMusica(musica.url) : null), [habilitada, musica?.activa, musica?.url])
  const autoReproducir = musica?.autoReproducir !== false
  const audio = useRef<HTMLAudioElement | null>(null)
  const iframe = useRef<HTMLIFrameElement | null>(null)
  const [iniciada, setIniciada] = useState(false)
  const [sonando, setSonando] = useState(false)
  const [spotifyVisible, setSpotifyVisible] = useState(false)

  useEffect(() => {
    setIniciada(false)
    setSonando(false)
    setSpotifyVisible(false)
    if (fuente?.tipo !== 'audio') return
    const a = new Audio(fuente.url)
    a.loop = true
    a.volume = 0.45
    a.onplay = () => setSonando(true)
    a.onpause = () => setSonando(false)
    audio.current = a
    return () => {
      a.pause()
      audio.current = null
    }
  }, [fuente])

  // YouTube informa si está sonando o en pausa
  useEffect(() => {
    if (fuente?.tipo !== 'youtube') return
    const alMensaje = (e: MessageEvent) => {
      if (!iframe.current || e.source !== iframe.current.contentWindow) return
      try {
        const datos = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
        const estado = datos?.info?.playerState
        if (estado === 1) setSonando(true)
        else if (estado === 0 || estado === 2) setSonando(false)
      } catch {}
    }
    window.addEventListener('message', alMensaje)
    return () => window.removeEventListener('message', alMensaje)
  }, [fuente])

  const comandoYouTube = (func: 'playVideo' | 'pauseVideo') =>
    iframe.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*')

  const iniciar = useCallback(() => {
    if (!fuente || !autoReproducir) return
    setIniciada(true)
    if (fuente.tipo === 'audio') audio.current?.play().catch(() => {})
    if (fuente.tipo === 'spotify') setSpotifyVisible(true)
  }, [fuente, autoReproducir])

  const alternar = () => {
    if (!fuente) return
    if (fuente.tipo === 'spotify') {
      setIniciada(true)
      setSpotifyVisible((v) => !v)
    } else if (fuente.tipo === 'audio') {
      const a = audio.current
      if (a?.paused) a.play().catch(() => {})
      else a?.pause()
    } else if (!iniciada) {
      setIniciada(true)
    } else {
      comandoYouTube(sonando ? 'pauseVideo' : 'playVideo')
    }
  }

  const posicion = contenida ? 'absolute' : 'fixed'
  let reproductor: React.ReactNode = null
  if (fuente?.tipo === 'youtube' && iniciada) {
    const params = new URLSearchParams({ autoplay: '1', loop: '1', playlist: fuente.id, controls: '0', playsinline: '1', enablejsapi: '1' })
    if (fuente.inicio) params.set('start', String(fuente.inicio))
    if (typeof window !== 'undefined') params.set('origin', window.location.origin)
    reproductor = (
      <iframe
        ref={iframe}
        title="Música de fondo"
        src={`https://www.youtube-nocookie.com/embed/${fuente.id}?${params.toString()}`}
        allow="autoplay; encrypted-media"
        onLoad={() => iframe.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 'tarjeton', channel: 'widget' }), '*')}
        style={{ position: posicion, left: 0, bottom: 0, width: 1, height: 1, border: 0, opacity: 0, pointerEvents: 'none' }}
      />
    )
  } else if (fuente?.tipo === 'spotify' && iniciada) {
    reproductor = (
      <div
        style={{
          position: posicion,
          left: 16,
          right: 16,
          bottom: 72,
          zIndex: 61,
          maxWidth: 400,
          margin: '0 auto',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          transform: spotifyVisible ? 'none' : 'translateY(calc(100% + 120px))',
          opacity: spotifyVisible ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
        }}
      >
        <iframe
          title="Canción en Spotify"
          src={`${fuente.embed}?utm_source=generator&theme=0`}
          width="100%"
          height="80"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          style={{ border: 0, display: 'block' }}
        />
      </div>
    )
  }

  return { fuente, iniciar, alternar, sonando, reproductor, esSpotify: fuente?.tipo === 'spotify', spotifyVisible }
}
