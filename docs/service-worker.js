const CACHE_NAME = "caremap-cache-v1";

// Optionally pre-cache these (can skip for now or add essentials)
const PRECACHE_ASSETS = [
  "./index.html",
  "./app.js",
  "./manifest.json",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

// Install event — cache core files
self.addEventListener("install", (e) => {
  console.log("📦 Service Worker: Installed");
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Caching core assets");
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event — clean up old caches if needed
self.addEventListener("activate", (e) => {
  console.log("🚀 Service Worker: Activated");

  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Removing old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // Optional: take control of any open pages
});

// Fetch event — try cache first, fallback to network
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(e.request).catch(() =>
          new Response("⚠️ Offline. Resource not cached.", {
            status: 503,
            statusText: "Offline",
          })
        )
      );
    })
  );
});