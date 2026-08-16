const DEVICE_ID_KEY = "agenda_device_id";

export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (err) {
    console.error("Service worker registration failed:", err);
    return null;
  }
}

export async function getNotificationPermission() {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (typeof Notification === "undefined") return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export async function subscribeToPush() {
  if (!isPushSupported()) return { ok: false, reason: "unsupported" };

  const permission = await requestNotificationPermission();
  if (permission !== "granted") return { ok: false, reason: permission };

  const registration = await registerServiceWorker();
  if (!registration) return { ok: false, reason: "no-service-worker" };

  await navigator.serviceWorker.ready;

  const res = await fetch("/api/vapid-public-key");
  if (!res.ok) return { ok: false, reason: "no-vapid-key" };
  const { publicKey } = await res.json();
  if (!publicKey) return { ok: false, reason: "no-vapid-key" };

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const deviceId = getDeviceId();
  const subRes = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId, subscription }),
  });

  if (!subRes.ok) return { ok: false, reason: "subscribe-failed" };
  return { ok: true, permission: "granted" };
}

export async function unsubscribeFromPush() {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) await subscription.unsubscribe();
  await fetch("/api/push/unsubscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId: getDeviceId() }),
  });
}

export async function syncDataToServer({ schedules, reminders, settings }) {
  try {
    await fetch("/api/data/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: getDeviceId(),
        schedules,
        reminders,
        settings,
      }),
    });
  } catch (err) {
    console.error("Failed to sync data to server:", err);
  }
}

export async function sendTestNotification() {
  const deviceId = getDeviceId();
  const res = await fetch("/api/push/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Test notification failed");
  }
}

export async function showLocalNotification(title, body) {
  if (!isPushSupported()) return false;
  const permission = Notification.permission;
  if (permission !== "granted") return false;

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, { body, tag: "agenda-local" });
  return true;
}
