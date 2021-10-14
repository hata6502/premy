const cacheName = "v3";
const requests = [".", "./dist/index.js", "./favicon.png"];

// eslint-disable-next-line no-restricted-globals
const serviceWorker = self as unknown as ServiceWorkerGlobalScope &
  typeof globalThis;

serviceWorker.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys.map(async (key) => {
          if (key === cacheName) {
            return;
          }

          await caches.delete(key);
        })
      );
    })()
  );
});

serviceWorker.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const cacheResponse = await caches.match(event.request);

      if (cacheResponse) {
        return cacheResponse;
      }

      const fetchResponse = await fetch(event.request);

      return fetchResponse;
    })()
  );
});

serviceWorker.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);

      return cache.addAll(requests);
    })()
  );
});
