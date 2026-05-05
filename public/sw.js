const CACHE_NAME = 'quranify-cache-v2';
const AUDIO_CACHE = 'quranify-audio';

// Only cache truly static assets
const STATIC_ASSETS = [
  '/icon-512.png',
  '/logo.png',
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

  // Audio files: cache-first (they're big and don't change)
  if (url.pathname.endsWith('.mp3') || url.hostname === 'download.quranicaudio.com') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request);
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

  // Everything else (HTML, CSS, JS): network-first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
