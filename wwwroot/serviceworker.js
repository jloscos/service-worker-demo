const version = "v1";

const cacheKeys = {
	static: "static-" + version,
	dynamic: "dynamic-" + version
}

const staticResources = [
    "/",
    "/favicon.ico",
    "/js/site.js",
    "/css/site.css",
    "/lib/jquery/dist/jquery.js",
    "/lib/bootstrap/dist/css/bootstrap.css",
    "/lib/bootstrap/dist/js/bootstrap.js"
];

self.addEventListener("install", (event) => {
	event.waitUntil(caches.open(cacheKeys.static).then(cache => {
		cache.addAll(staticResources);
	}));
});

self.addEventListener("activate", (event) => {
	event.waitUntil(caches.keys().then(keys =>
		Promise.all(
			keys.filter(k => !Object.values(cacheKeys).includes(k))
				.map(k => caches.delete(k))
		)
    ));
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    //Les resources static sont en cache only
    if (staticResources.includes(event.request.url))
        event.respondWith(getFromStaticCache(event));
        //la liste des article est chargé en cache first + refresh
    else if (event.request.url == "/Feed")
        event.waitUntil(respondWithCacheFirstAndRefresh(event));
    //Les resources d'un article sont chargé en cache first
    else if (event.request.referer.startsWith("/Feed/ArticleContent"))
        event.waitUntil(respondWithCacheFirst(event));
    // les autres cas (robot.txt, futures pages de l'appli, ...) sont en network first
    else 
        event.waitUntil(respondWithNetworkFirst(event));
});

async function getFromStaticCache(event) {
    const cache = await caches.open(cacheKeys.static);
    const response = await cache.match(event.request);
    return response;
}

async function respondWithNetworkFirst(event) {
    const response = await fetch(event.request);
    event.respondWith(response);
    if (response && response.ok) {
        const cache = await caches.open(cacheKeys.dynamic);
        await cache.put(event.request, response.clone());
    }
}

async function respondWithCacheFirst(event) {
    const cache = await caches.open(cacheKeys.dynamic);
    let response = await cache.match(event.request);
    if (response) {
        event.respondWith(reponse);
    } else {
        response = await fetch(event.request);
        if (response && reponse.ok) {
            event.respondWith(response);
            await cache.put(event.reponse, reponse.clone());
        }
    }
}

async function respondWithCacheFirstAndRefresh(event) {
    const cache = await caches.open(cacheKeys.dynamic);
    let response = await cache.match(event.request);
    if (response) {
        event.respondWith(reponse);
        const fetchResponse = await fetch(event.request);
        await cache.put(event.request, fetchResponse);
    } else {
        response = await fetch(event.request);
        if (response && reponse.ok) {
            event.respondWith(response);
            await cache.put(event.reponse, reponse.clone());
        }
    }
}
