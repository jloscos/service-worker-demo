const version = "v1";

const cacheKeys = {
	static: "static-" + version,
	dynamic: "dynamic-" + version
}

self.addEventListener("install", (event) => {
	event.waitUntil(caches.open(cacheKeys.static).then(cache => {
		cache.addAll([
			"/",
			"/favicon.ico",
			"/Feed",
			"/js/site.js",
			"/css/site.css",
			"/lib/jquery/dist/jquery.js",
			"/lib/bootstrap/dist/css/bootstrap.css",
			"/lib/bootstrap/dist/js/bootstrap.js"
		]);
	}));
});

self.addEventListener("activate", (event) => {
	event.waitUntil(caches.keys().then(keys =>
		Promise.all(
			keys.filter(k => !Object.values(cacheKeys).includes(k))
				.map(k => caches.delete(k))
		)
	));
});

self.addEventListener("fetch", (event) => {
	console.log(event.request);
	event.respondWith(searchCaches(event));
});

async function searchCaches(event) {
	let cache = await caches.open(cacheKeys.static);
	const staticResource = await cache.match(event.request, { ignoreSearch: true });
	if (staticResource)
		return staticResource;
	cache = await caches.open(cacheKeys.dynamic);
	const dynamicResource = await cache.match(event.request);
	if (dynamicResource)
		return dynamicResource;
	const response = await fetch(event.request);
	console.log(response);
	cache.put(event.request, response.clone());
	return response;	
}