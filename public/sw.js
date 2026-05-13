const CACHE_NAME = 'quranify-cache-v4';
const AUDIO_CACHE = 'quranify-audio';

// Only cache truly static assets
const STATIC_ASSETS = [
  '/',
  '/icon-512.png',
  '/icon.png',
  '/manifest.json'
];

// Install: cache only static assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate: clean old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== AUDIO_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim()) // Take control of all pages
  );
});

// Fetch: Network-first for pages/scripts, Cache-first for audio & static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Audio files: cache-first with Range request support for iOS Safari
  if (url.pathname.endsWith('.mp3') || url.hostname === 'download.quranicaudio.com') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          const rangeHeader = event.request.headers.get('range');
          if (rangeHeader) {
            return cachedResponse.arrayBuffer().then(buffer => {
              const bytes = rangeHeader.replace(/bytes=/, '').split('-');
              const start = parseInt(bytes[0], 10);
              const end = bytes[1] ? parseInt(bytes[1], 10) : buffer.byteLength - 1;
              const chunk = buffer.slice(start, end + 1);
              return new Response(chunk, {
                status: 206,
                statusText: 'Partial Content',
                headers: {
                  'Content-Range': `bytes ${start}-${end}/${buffer.byteLength}`,
                  'Content-Length': chunk.byteLength.toString(),
                  'Content-Type': cachedResponse.headers.get('content-type') || 'audio/mpeg',
                  'Accept-Ranges': 'bytes'
                }
              });
            });
          }
          return cachedResponse;
        }
        return fetch(event.request);
      })
    );
    return;
  }

  // Static assets (images, manifest): cache-first
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request);
      })
    );
    return;
  }

  // Everything else (HTML, CSS, JS): network-first, save to cache, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache basic (same-origin) and CORS (external APIs like api.quran.com) responses
        if (response.ok && (response.type === 'basic' || response.type === 'cors')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
