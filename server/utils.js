export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function daysForSchedule(s) {
  if (s.repeat === "daily") return [0, 1, 2, 3, 4, 5, 6];
  if (s.repeat === "weekdays") return [0, 1, 2, 3, 4];
  return [s.day];
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function weekdayIndexMonday(d) {
  return (d.getDay() + 6) % 7;
}

export function getReminderNextOccurrence(rem, now) {
  const [y, mo, da] = rem.date.split("-").map(Number);
  const [h, mi] = rem.time.split(":").map(Number);
  const base = new Date(y, mo - 1, da, h, mi, 0, 0);

  if (rem.repeat === "once") return base;

  if (rem.repeat === "daily") {
    let cand = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, mi, 0, 0);
    if (cand < now) cand = addDays(cand, 1);
    if (cand < base) cand = base;
    return cand;
  }

  if (rem.repeat === "weekdays") {
    let cand = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, mi, 0, 0);
    if (cand < now) cand = addDays(cand, 1);
    if (cand < base) cand = new Date(base);
    while (cand.getDay() === 0 || cand.getDay() === 6) cand = addDays(cand, 1);
    return cand;
  }

  if (rem.repeat === "weekly") {
    const targetDow = base.getDay();
    let cand = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, mi, 0, 0);
    while (cand.getDay() !== targetDow) cand = addDays(cand, 1);
    if (cand < now) cand = addDays(cand, 7);
    if (cand < base) cand = base;
    return cand;
  }
  return base;
}

export function collectDueNotifications(schedules, reminders, now, firedKeys) {
  const notifications = [];
  const newFired = [];

  if (!schedules?.length && !reminders?.length) return { notifications, newFired };

  const nowDow = weekdayIndexMonday(now);

  for (const s of schedules || []) {
    if (!daysForSchedule(s).includes(nowDow)) continue;
    const startMin = toMinutes(s.start);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const notifyAt = startMin - (s.reminder ?? 0);
    const fireKey = `sched-${s.id}-${dateKey(now)}`;
    if (Math.abs(nowMin - notifyAt) <= 1 && !firedKeys.has(fireKey)) {
      newFired.push(fireKey);
      const msg =
        (s.reminder ?? 0) === 0
          ? `Starting now${s.location ? " · " + s.location : ""}`
          : `Starts in ${s.reminder} min${s.location ? " · " + s.location : ""}`;
      notifications.push({ title: s.title, body: msg });
    }
  }

  for (const r of reminders || []) {
    const occ = getReminderNextOccurrence(r, now);
    const notifyAt = new Date(occ.getTime() - (r.notifyBefore ?? 0) * 60000);
    const diffSec = Math.abs((notifyAt.getTime() - now.getTime()) / 1000);
    const fireKey = `rem-${r.id}-${occ.toISOString().slice(0, 16)}`;
    if (diffSec <= 30 && !firedKeys.has(fireKey)) {
      newFired.push(fireKey);
      const msg = (r.notifyBefore ?? 0) === 0 ? "Due now" : `Due in ${r.notifyBefore} min`;
      notifications.push({ title: r.title, body: msg });
    }
  }

  return { notifications, newFired };
}
