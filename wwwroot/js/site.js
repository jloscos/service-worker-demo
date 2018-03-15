if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/serviceworker.js');
};

$(function () {
	if (!navigator.onLine) {
		$(".body-content a").each(function () {
			caches.open("dynamic-v1").then(cache => {
				cache.match($(this).attr("href"))
					.then(response => {
						if (!response)
							$(this).attr("disabled", "disabled");
					});
			});
		});
	}
});