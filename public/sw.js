const CACHE_NAME = 'basketi-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/App.vue',
  '/src/assets/style.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Handle PWA installation
self.addEventListener('beforeinstallprompt', (event) => {
  // Store the event so it can be triggered later
  self.deferredPrompt = event;
});

// Handle navigation to ensure proper PWA behavior
self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If offline, return the home page
          return caches.match('/');
        })
    );
  }
});
