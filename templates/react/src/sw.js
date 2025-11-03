// src/sw.js (Custom Service Worker Logic for Push)

// This file is used by the Workbox plugin (via injectManifest)
// to add custom event handlers to the generated Service Worker.

// 1. Handle incoming push events (when the server sends a message)
self.addEventListener('fetch', (event) => {
  const data = event.data ? event.data.json() : {
    title: 'New PWA Message',
    body: 'You received a push notification!',
    icon: '/icons/pwa-icon-512.png'
  };

  // Wait until the notification is displayed
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.icon,
      data: data.data // optional data to pass back on click
    })
  );
});

// 2. Handle notification clicks (when the user clicks the notification)
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification

  // Focus on the app's window, or open a new tab
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Workbox global import (necessary if using injectManifest)
// This must be filled in by the Workbox plugin setup
// self.__WB_MANIFEST;