import webpush from "web-push";
import { collectDueNotifications } from "./utils.js";
import { getAllDevices, addFiredKeys, pruneOldFiredKeys, removeSubscription } from "./store.js";

export function startNotificationScheduler(vapidDetails) {
  webpush.setVapidDetails(vapidDetails.subject, vapidDetails.publicKey, vapidDetails.privateKey);

  setInterval(async () => {
    pruneOldFiredKeys();
    const now = new Date();

    for (const device of getAllDevices()) {
      if (!device.subscription) continue;
      if (device.settings?.notificationsEnabled === false) continue;

      const firedSet = new Set(device.firedKeys || []);
      const { notifications, newFired } = collectDueNotifications(
        device.schedules,
        device.reminders,
        now,
        firedSet
      );

      if (!notifications.length) continue;

      for (const notif of notifications) {
        try {
          await webpush.sendNotification(
            device.subscription,
            JSON.stringify({ title: notif.title, body: notif.body })
          );
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            removeSubscription(device.id);
          }
          console.error("Push failed for device", device.id, err.message);
        }
      }

      addFiredKeys(device.id, newFired);
    }
  }, 30000);

  console.log("Notification scheduler started (every 30s)");
}
