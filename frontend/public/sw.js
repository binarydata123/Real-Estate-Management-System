/* public/sw.js */
self.addEventListener("push", function (event) {
    if (event.data) {
      const data = event.data.json();
      const title = data.title || "New Notification";
      const options = {
        body: data.body || "",
        icon: "/icons/app-icon-192.png",
        badge: "/icons/app-icon-192.png",
        data: data.url || "/",
      };
  
      event.waitUntil(self.registration.showNotification(title, options));
    }
  });
  
  self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    if (event.notification.data) {
      event.waitUntil(
        clients.openWindow(event.notification.data)
      );
    }
  });
  