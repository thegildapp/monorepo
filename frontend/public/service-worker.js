const CACHE_NAME = 'gild-images-v1';
const IMAGE_CACHE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
const IMAGE_CACHE_MAX_ENTRIES = 100;

// Cache strategies
const cacheStrategies = {
  // Network first, fallback to cache
  networkFirst: async (request) => {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  },

  // Cache first, fallback to network
  cacheFirst: async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check if cache is still fresh
      const cachedDate = new Date(cachedResponse.headers.get('date'));
      const now = new Date();
      const age = (now - cachedDate) / 1000;
      
      if (age < IMAGE_CACHE_MAX_AGE) {
        return cachedResponse;
      }
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      
      // Clean up old entries
      cleanupCache();
    }
    return networkResponse;
  }
};

// Clean up old cache entries
async function cleanupCache() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  if (keys.length > IMAGE_CACHE_MAX_ENTRIES) {
    // Delete oldest entries
    const keysToDelete = keys.slice(0, keys.length - IMAGE_CACHE_MAX_ENTRIES);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle image requests
  if (!request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return;
  }
  
  // Handle Digital Ocean Spaces images
  if (url.hostname.includes('digitaloceanspaces.com')) {
    event.respondWith(cacheStrategies.cacheFirst(request));
    return;
  }
  
  // Handle other images
  if (request.destination === 'image') {
    event.respondWith(cacheStrategies.cacheFirst(request));
  }
});

// Message event for cache management
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});