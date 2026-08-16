import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadStore() {
  ensureDataDir();
  if (!fs.existsSync(STORE_FILE)) {
    return { devices: {} };
  }
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed?.devices ? parsed : { devices: {} };
  } catch {
    return { devices: {} };
  }
}

function saveStore(store) {
  ensureDataDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

let store = loadStore();

export function getDevice(deviceId) {
  return store.devices[deviceId] || null;
}

export function upsertDevice(deviceId, patch) {
  const existing = store.devices[deviceId] || {
    subscription: null,
    schedules: [],
    reminders: [],
    settings: { notificationsEnabled: true },
    firedKeys: [],
  };
  store.devices[deviceId] = { ...existing, ...patch };
  saveStore(store);
  return store.devices[deviceId];
}

export function removeSubscription(deviceId) {
  if (!store.devices[deviceId]) return;
  store.devices[deviceId].subscription = null;
  saveStore(store);
}

export function getAllDevices() {
  return Object.entries(store.devices).map(([id, data]) => ({ id, ...data }));
}

export function addFiredKeys(deviceId, keys) {
  const device = store.devices[deviceId];
  if (!device) return;
  const set = new Set(device.firedKeys || []);
  keys.forEach((k) => set.add(k));
  device.firedKeys = [...set].slice(-500);
  saveStore(store);
}

export function pruneOldFiredKeys() {
  const today = new Date().toISOString().slice(0, 10);
  let changed = false;
  for (const device of Object.values(store.devices)) {
    const before = device.firedKeys?.length || 0;
    device.firedKeys = (device.firedKeys || []).filter((k) => k.includes(today));
    if (device.firedKeys.length !== before) changed = true;
  }
  if (changed) saveStore(store);
}
