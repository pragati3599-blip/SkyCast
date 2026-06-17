const CACHE_NAME = 'skycast-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/images/logo.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install Event - Caches assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event - Cleans up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Serves from cache, falling back to network
self.addEventListener('fetch', (e) => {
  // We only cache GET requests
  if (e.request.method !== 'GET') return;
  
  // Don't intercept API requests (always fresh)
  if (e.request.url.includes('api.open-meteo.com') || e.request.url.includes('geocoding-api.open-meteo.com')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Fallback to network if not in cache
      return fetch(e.request).then((response) => {
        // Cache new assets dynamically (optional, but good for fonts)
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        
        return response;
      });
    }).catch(() => {
      // If network fails and it's an HTML request, we could serve a fallback
      // But for a simple weather app, serving the cached index.html is sufficient
      if (e.request.headers.get('accept').includes('text/html')) {
        return caches.match('/index.html');
      }
    })
  );
});
