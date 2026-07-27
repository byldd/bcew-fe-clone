// Service Worker for Push Notifications
self.addEventListener("push", function (event) {
	if (event.data) {
		const data = event.data.json();
		const options = {
			body: data.body,

			vibrate: [100, 50, 100],
			data: data.data || {},
		};
		event.waitUntil(self.registration.showNotification(data.title, options));
	}
});

self.addEventListener("notificationclick", function (event) {
	try {
		event.notification.close();
	} catch (e) {
		// do nothing
	}
	const notificationData = event?.notification?.data;

	let urlToOpen = notificationData?.url || `/`;

	event.waitUntil(clients.openWindow(urlToOpen));
});
