/* public/sw.js */
self.addEventListener("push", function (event) {
  const data = event.data.json();

  // Show notification with actions
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/icons/app-icon-192.png",
      badge: data.badge || "/icons/app-icon-192.png",
      data: data.data,
      actions: data.actions || [],
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
const API_BASE_URL = "http://localhost:5001/api";

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { meetingId, token } = event.notification.data;
  console.log(event.action);

  if (event.action === "confirm") {
    event.waitUntil(
      fetch(`${API_BASE_URL}/agent/meetings/update-status/${meetingId}`, {
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
      fetch(`${API_BASE_URL}/agent/meetings/update-status/${meetingId}`, {
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