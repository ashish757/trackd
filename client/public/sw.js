// Service Worker for Push Notifications

self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    console.log('Push notification received');
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'New notification from Trackd',
        icon: data.icon || '/logo.svg',
        badge: '/logo.svg',
        data: data.data,
        tag: data.tag || 'trackd-notification',
        requireInteraction: false,
        silent: false,
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Trackd', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked');
    event.notification.close();

    event.waitUntil(
        self.clients.openWindow('/')
    );
});

