// Service Worker for caching static assets and API responses
const CACHE_NAME = 'pdenglish-v1';
const STATIC_CACHE = 'pdenglish-static-v1';
const API_CACHE = 'pdenglish-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// API endpoints to cache with shorter TTL
const API_ENDPOINTS = [
  '/api/',
  'https://fnlkqteqyxzwtwcnaxan.supabase.co/rest/v1/',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== API_CACHE;
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle static assets (HTML, CSS, JS, images)
  if (request.destination === 'document' || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'image') {
    
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then((response) => {
              // Don't cache if not a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response
              const responseToCache = response.clone();

              caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });

              return response;
            });
        })
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/') || 
      url.hostname.includes('supabase.co')) {
    
    event.respondWith(
      caches.open(API_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((response) => {
              // If cached and less than 5 minutes old, return cached version
              if (response) {
                const cacheTime = response.headers.get('sw-cache-time');
                if (cacheTime) {
                  const age = Date.now() - parseInt(cacheTime);
                  if (age < 5 * 60 * 1000) { // 5 minutes
                    return response;
                  }
                }
              }

              // Fetch from network
              return fetch(request)
                .then((response) => {
                  // Clone response and add cache timestamp
                  const responseToCache = response.clone();
                  const headers = new Headers(responseToCache.headers);
                  headers.set('sw-cache-time', Date.now().toString());
                  
                  const modifiedResponse = new Response(responseToCache.body, {
                    status: responseToCache.status,
                    statusText: responseToCache.statusText,
                    headers: headers,
                  });

                  // Cache successful responses
                  if (response.status === 200) {
                    cache.put(request, modifiedResponse);
                  }

                  return response;
                })
                .catch(() => {
                  // Return cached response if network fails
                  return response || new Response(
                    JSON.stringify({ error: 'Offline' }),
                    { status: 503, statusText: 'Service Unavailable' }
                  );
                });
            });
        })
    );
    return;
  }

  // For all other requests, try cache first, then network
  event.respondWith(
    caches.match(request)
      .then((response) => {
        return response || fetch(request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any pending offline actions here
      Promise.resolve()
    );
  }
});

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      actions: [
        {
          action: 'explore',
          title: 'Go to App',
          icon: '/pwa-192x192.png',
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/pwa-192x192.png',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
