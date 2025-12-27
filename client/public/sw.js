self.addEventListener('push', (event) => {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: data.icon || '/logo.svg',
        badge: '/logo.svg',
        data: data.data, // Custom metadata
        tag: data.tag,
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});