export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const CATEGORY_PALETTE = [
  { key: "blue", dot: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/40", soft: "bg-blue-500/10" },
  { key: "teal", dot: "bg-teal-500", text: "text-teal-400", border: "border-teal-500/40", soft: "bg-teal-500/10" },
  { key: "violet", dot: "bg-violet-500", text: "text-violet-400", border: "border-violet-500/40", soft: "bg-violet-500/10" },
  { key: "amber", dot: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/40", soft: "bg-amber-500/10" },
  { key: "rose", dot: "bg-rose-500", text: "text-rose-400", border: "border-rose-500/40", soft: "bg-rose-500/10" },
  { key: "emerald", dot: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/40", soft: "bg-emerald-500/10" },
];

export const DEFAULT_CATEGORIES = [
  { id: "work", name: "Work", color: "blue" },
  { id: "personal", name: "Personal", color: "teal" },
  { id: "health", name: "Health", color: "emerald" },
  { id: "study", name: "Study", color: "violet" },
  { id: "social", name: "Social", color: "amber" },
  { id: "other", name: "Other", color: "rose" },
];

export const REPEAT_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "once", label: "Once" },
  { value: "daily", label: "Every day" },
  { value: "weekdays", label: "Weekdays" },
];

export const REMINDER_REPEAT_OPTIONS = [
  { value: "once", label: "Once" },
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekly", label: "Weekly" },
];

export const NOTIFY_OPTIONS = [
  { value: 0, label: "At the scheduled time" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
];

export const DAY_START_MIN = 6 * 60;   // 06:00
export const DAY_END_MIN = 24 * 60;    // 24:00
export const PX_PER_MIN = 1.1;
