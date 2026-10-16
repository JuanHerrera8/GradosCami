/*
 * Service worker de Tarjetón (PWA).
 * - Recursos estáticos de Next (/_next/static, íconos, fuentes): cache-first.
 * - Navegación: siempre red; si no hay conexión, se sirve la última copia guardada.
 * - API, admin y pagos nunca se cachean.
 */
const VERSION = 'tarjeton-v1'
const CACHE_ESTATICOS = `${VERSION}-estaticos`
const CACHE_PAGINAS = `${VERSION}-paginas`

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => !c.startsWith(VERSION)).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  )
})

function esEstatico(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/pwa-icon/') ||
    /\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return

  if (esEstatico(url)) {
    event.respondWith(
      caches.match(request).then(
        (enCache) =>
          enCache ||
          fetch(request).then((respuesta) => {
            if (respuesta.ok) {
              const copia = respuesta.clone()
              caches.open(CACHE_ESTATICOS).then((cache) => cache.put(request, copia))
            }
            return respuesta
          })
      )
    )
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone()
            caches.open(CACHE_PAGINAS).then((cache) => cache.put(request, copia))
          }
          return respuesta
        })
        .catch(() => caches.match(request).then((enCache) => enCache || caches.match('/')))
    )
  }
})
