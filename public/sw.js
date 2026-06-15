/**
 * Coltura service worker — network-first, offline-capable shell.
 *
 * Network-first means online users always get fresh assets (no stale-build
 * surprises); responses are cached as they go, so the app still loads offline.
 * API routes are never cached. The user's data already lives in IndexedDB, so
 * with the shell cached the app works on a plane.
 */
const CACHE = "coltura-shell-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // third-party (incl. Anthropic API)
  if (url.pathname.startsWith("/api/")) return; // never cache API responses

  event.respondWith(
    (async () => {
      try {
        const res = await fetch(req);
        if (res && res.status === 200 && res.type === "basic") {
          const cache = await caches.open(CACHE);
          cache.put(req, res.clone());
        }
        return res;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") {
          const shell = await caches.match("/finds");
          if (shell) return shell;
        }
        throw new Error("offline and not cached");
      }
    })(),
  );
});
