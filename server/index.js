import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import webpush from "web-push";
import { rateLimit } from "express-rate-limit";
import { upsertDevice, removeSubscription } from "./store.js";
import { startNotificationScheduler } from "./notificationScheduler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const DIST_DIR = path.join(__dirname, "..", "dist");

const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@agenda.app";

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  const keys = webpush.generateVAPIDKeys();
  console.warn("VAPID keys not set — generated ephemeral keys for this session.");
  console.warn("Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Render env for production.");
  process.env.VAPID_PUBLIC_KEY = keys.publicKey;
  process.env.VAPID_PRIVATE_KEY = keys.privateKey;
}

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

const app = express();
app.use(express.json());

// Rate limiters to prevent API abuse & spam
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const syncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Limit each IP to 30 sync/subscription requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many sync requests, please try again later." },
});

const pushTestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit each IP to 5 test notifications per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Test notification limit reached. Please wait before trying again." },
});

app.use("/api/", globalApiLimiter);
app.use(["/api/push/subscribe", "/api/push/unsubscribe", "/api/data/sync"], syncLimiter);
app.use("/api/push/test", pushTestLimiter);

app.get("/api/vapid-public-key", (_req, res) => {
  res.json({ publicKey });
});

app.post("/api/push/subscribe", (req, res) => {
  const { deviceId, subscription } = req.body || {};
  if (!deviceId || !subscription?.endpoint) {
    return res.status(400).json({ error: "deviceId and subscription required" });
  }
  upsertDevice(deviceId, { subscription });
  res.json({ ok: true });
});

app.delete("/api/push/unsubscribe", (req, res) => {
  const { deviceId } = req.body || {};
  if (!deviceId) return res.status(400).json({ error: "deviceId required" });
  removeSubscription(deviceId);
  res.json({ ok: true });
});

app.post("/api/data/sync", (req, res) => {
  const { deviceId, schedules, reminders, settings } = req.body || {};
  if (!deviceId) return res.status(400).json({ error: "deviceId required" });
  upsertDevice(deviceId, {
    schedules: schedules ?? [],
    reminders: reminders ?? [],
    settings: settings ?? { notificationsEnabled: true },
  });
  res.json({ ok: true });
});

app.post("/api/push/test", async (req, res) => {
  const { deviceId } = req.body || {};
  if (!deviceId) return res.status(400).json({ error: "deviceId required" });
  const device = upsertDevice(deviceId, {});
  if (!device.subscription) {
    return res.status(400).json({ error: "No push subscription for this device" });
  }
  try {
    webpush.setVapidDetails(vapidSubject, publicKey, privateKey);
    await webpush.sendNotification(
      device.subscription,
      JSON.stringify({ title: "Agenda", body: "Background notifications are working!" })
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const distExists = fs.existsSync(DIST_DIR);
if (process.env.NODE_ENV === "production" || distExists) {
  app.use(express.static(DIST_DIR));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(DIST_DIR, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

startNotificationScheduler({ subject: vapidSubject, publicKey, privateKey });

app.listen(PORT, () => {
  console.log(`Agenda server listening on port ${PORT}`);
});
