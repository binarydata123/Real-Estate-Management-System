/* public/sw.js */ self.addEventListener("push", function (event) {
  const data = event.data.json();

  // Show notification
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/app-icon-192.png",
      badge: "/icons/app-icon-192.png",
      data: { url: data.url, message: data.body },
    })
  );

  // Send message to clients
  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ includeUncontrolled: true });
      for (const client of allClients) {
        client.postMessage({
          type: "SPEAK_MESSAGE",
          message: data.body,
        });
      }
    })()
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  if (event.notification.data) {
    event.waitUntil(clients.openWindow(event.notification.data));
  }
});
