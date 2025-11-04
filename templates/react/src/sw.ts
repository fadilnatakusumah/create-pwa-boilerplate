// src/sw.js (Custom Service Worker Logic for Push)

// This file is used by the Workbox plugin (via injectManifest)
// to add custom event handlers to the generated Service Worker.

const sw = self as unknown as ServiceWorkerGlobalScope;

// 1. Handle incoming push events (when the server sends a message)
sw.addEventListener("push", (event: PushEvent) => {
  const data = event.data
    ? event.data.json()
    : {
        title: "New PWA Message",
        body: "You received a push notification!",
        icon: "/icons/pwa-icon-512.png",
      };

  // Wait until the notification is displayed
  event.waitUntil(
    sw.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.icon,
      data: data.data, // optional data to pass back on click
    })
  );
});

// 2. Handle notification clicks (when the user clicks the notification)
sw.addEventListener("notificationclick", (event) => {
  event.notification.close(); // Close the notification

  // Focus on the app's window, or open a new tab
  event.waitUntil(
    sw.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (sw.clients.openWindow) {
        return sw.clients.openWindow("/");
      }
    })
  );
});

// Workbox global import (necessary if using injectManifest)
// This must be filled in by the Workbox plugin setup
// sw.__WB_MANIFEST;
