// Minimale service worker. Bestaat vooral zodat Android de app als
// installeerbaar herkent; hij houdt daarnaast de vaste bestanden bij de
// hand zodat de app ook bij een trage verbinding meteen opent.

const CACHE = 'schema-v1'
const SHELL = ['/icons/icon-192.png', '/icons/icon-512.png', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Alleen losse GET-bestanden cachen. Pagina's en serveracties moeten
  // altijd vers zijn — een verouderd schema is erger dan even wachten.
  if (request.method !== 'GET' || request.mode === 'navigate') return
  if (!request.url.startsWith(self.location.origin)) return

  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ??
        fetch(request).then((response) => {
          if (response.ok && request.url.includes('/icons/')) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
    )
  )
})
