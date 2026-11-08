const CACHE = "travel-packing-list-v1.2.0";
const BASE = "/travel-packing-list/";
const ASSETS = [BASE, `${BASE}index.html`, `${BASE}manifest.webmanifest`, `${BASE}version.json`, `${BASE}icon-192.png`, `${BASE}icon-512.png`, `${BASE}icon-maskable-512.png`];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); });
self.addEventListener("message", event => { if (event.data?.type === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", event => { if (event.request.method !== "GET") return; const url = new URL(event.request.url); if (url.pathname.endsWith("/version.json")) { event.respondWith(fetch(event.request, { cache: "no-store" }).catch(() => caches.match(`${BASE}version.json`))); return; } if (event.request.mode === "navigate") { event.respondWith(fetch(event.request, { cache: "no-store" }).catch(() => caches.match(`${BASE}index.html`))); return; } event.respondWith(fetch(event.request).then(response => { const copy=response.clone(); caches.open(CACHE).then(cache => cache.put(event.request,copy)); return response; }).catch(() => caches.match(event.request))); });
