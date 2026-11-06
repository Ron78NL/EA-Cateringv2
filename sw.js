const PREFIX = "eac-v2-";  // eigen voorvoegsel: alle GitHub-apps delen één opslag
const CACHE = PREFIX + "7";
const BESTANDEN = ["./", "./index.html", "./styles.css", "./app.js", "./videos.js", "./nac-logo.png"];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE).then((c) => c.addAll(BESTANDEN)));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((namen) =>
            Promise.all(namen.filter((n) => (n.startsWith(PREFIX) || n.startsWith("ea-catering-")) && n !== CACHE).map((n) => caches.delete(n)))
        )
    );
    self.clients.claim();
});

// Eerst het netwerk, bij geen verbinding de cache
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
