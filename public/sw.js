const CACHE_NAME = 'basketi-v2'; // Increment version when updating
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon/favicon-96x96.png',
  '/favicon/apple-touch-icon.png',
  '/favicon/web-app-manifest-512x512.png',
  '/favicon/site.webmanifest'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Force new service worker to activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Delete old caches
          }
        })
      )
    ).then(() => self.clients.claim()) // Take control of clients immediately
  );
});

// Fetch event - cache-first for assets, network-first for navigation
self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/')) // Fallback to cached home page
    );
  } else {
    // Handle asset requests (JS, CSS, images, etc.)
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response; // Serve from cache
          }
          // Fetch from network and cache dynamically
          return fetch(event.request)
            .then((networkResponse) => {
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }
              // Clone the response to cache it
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
              return networkResponse;
            })
            .catch(() => {
              // Optionally handle offline asset requests
            });
        })
    );
  }
});

// Handle PWA installation prompt
self.addEventListener('beforeinstallprompt', (event) => {
  self.deferredPrompt = event; // Store for manual triggering if needed
});