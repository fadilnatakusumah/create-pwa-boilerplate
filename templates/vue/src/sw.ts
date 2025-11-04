// src/sw.ts

// This file is used by the Workbox plugin (via injectManifest)
// to add custom event handlers to the generated Service Worker.

// 🔑 CRITICAL FIX: Convert 'self' to 'unknown' first, then cast it to the ServiceWorkerGlobalScope.
const sw = self as unknown as ServiceWorkerGlobalScope;

// 1. Handle incoming push events
sw.addEventListener("push", (event: PushEvent) => {
  // Error Fixes: 'waitUntil' and 'data' are properties of PushEvent
  const data = event.data
    ? event.data.json()
    : {
        title: "New PWA Message",
        body: "You received a push notification!",
        icon: "/icons/pwa-icon-512.png",
        data: { url: "/" },
      };

  event.waitUntil(
    sw.registration.showNotification(data.title, {
      // registration property is accessed via sw
      body: data.body,
      icon: data.icon,
      badge: data.icon,
      data: data.data,
    })
  );
});

// 2. Handle notification clicks
sw.addEventListener("notificationclick", (event: NotificationEvent) => {
  // event.notification is available on NotificationEvent
  event.notification.close();

  // Access clients via the casted 'sw' variable
  event.waitUntil(
    sw.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (sw.clients.openWindow) {
        return sw.clients.openWindow("/");
      }
    })
  );
});

// Workbox global import (necessary if using injectManifest)
// This must be filled in by the Workbox plugin setup
// sw.__WB_MANIFEST;
