self.API_URL = null;

// Receive environment variables
self.addEventListener("message", (event) => {
  if (event.data?.type === "SET_ENV") {
    self.API_URL = event.data.API_URL;
  }
});

// Push event
self.addEventListener("push", function (event) {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/icons/app-icon-192.png",
      badge: data.badge || "/icons/app-icon-192.png",
      data: data.data,
      actions: data.actions || [],
    })
  );

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

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { meetingId, token } = event.notification.data;

  if (event.action === "confirm") {
    event.waitUntil(
      fetch(`${self.API_URL}/agent/meetings/update-status/${meetingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "confirmed" }),
      })
    );
  } else if (event.action === "cancel") {
    event.waitUntil(
      fetch(`${self.API_URL}/agent/meetings/update-status/${meetingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      })
    );
  } else {
    event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
  }
});
