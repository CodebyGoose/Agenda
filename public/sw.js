self.addEventListener("push", (event) => {
  let data = { title: "Agenda", body: "You have a reminder" };
  try {
    if (event.data) data = event.data.json();
  } catch {
    /* use defaults */
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Agenda", {
      body: data.body || "",
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: data.tag || "agenda-notification",
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});
