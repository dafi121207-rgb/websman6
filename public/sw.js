const CACHE = "sman6garut-pjok-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Static assets & uploads: cache-first. API & halaman: network-first agar data fresh.
  const isStatic =
    event.request.method === "GET" &&
    (url.pathname.startsWith("/_next/static") ||
      url.pathname.startsWith("/uploads/") ||
      url.pathname === "/logo.png" ||
      url.pathname === "/manifest.json");

  if (isStatic) {
    event.respondWith(
      caches.match(event.request).then(
        (hit) =>
          hit ||
          fetch(event.request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, copy));
            return res;
          })
      )
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((hit) => hit || Response.error()))
  );
});
