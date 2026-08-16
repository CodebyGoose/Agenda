import { CATEGORY_PALETTE } from "./constants.js";

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(hhmm, format24) {
  const [h, m] = hhmm.split(":").map(Number);
  if (format24) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function catInfo(categories, id) {
  const c = categories.find((c) => c.id === id) || categories[categories.length - 1];
  const palette = CATEGORY_PALETTE.find((p) => p.key === c.color) || CATEGORY_PALETTE[0];
  return { ...c, ...palette };
}

export function daysForSchedule(s) {
  if (s.repeat === "daily") return [0, 1, 2, 3, 4, 5, 6];
  if (s.repeat === "weekdays") return [0, 1, 2, 3, 4];
  return [s.day];
}

export function startOfWeek(date, firstDayMonday) {
  const d = new Date(date);
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - (firstDayMonday ? dow : d.getDay()));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function isSameDate(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function weekdayIndexMonday(d) {
  return (d.getDay() + 6) % 7; // 0=Mon .. 6=Sun
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

export function checkOverlap(schedules, day, start, end, excludeId) {
  const s1 = toMinutes(start), e1 = toMinutes(end);
  return schedules.filter((s) => s.id !== excludeId).some((s) => {
    if (!daysForSchedule(s).includes(day)) return false;
    const s2 = toMinutes(s.start), e2 = toMinutes(s.end);
    return s1 < e2 && s2 < e1;
  });
}
