import React, { useMemo, useState } from "react";
import { CalendarDays, AlertTriangle } from "lucide-react";
import { ModalShell, Field } from "./ModalShell.jsx";
import { DAY_NAMES, REPEAT_OPTIONS, NOTIFY_OPTIONS } from "../lib/constants.js";
import { toMinutes, checkOverlap } from "../lib/utils.js";

export default function ScheduleModal({ data, categories, schedules, settings, onClose, onSave }) {
  const editing = data.editing;
  const [form, setForm] = useState(() => editing ? { ...editing } : {
    title: "", day: data.defaultDay ?? 0, start: "09:00", end: "10:00",
    location: "", description: "", category: categories[0].id, repeat: "weekly", reminder: settings.defaultReminder,
  });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const overlap = useMemo(() => {
    if (!form.start || !form.end || toMinutes(form.end) <= toMinutes(form.start)) return false;
    return checkOverlap(schedules, form.day, form.start, form.end, editing?.id);
  }, [form.day, form.start, form.end, schedules, editing]);

  const invalidRange = form.start && form.end && toMinutes(form.end) <= toMinutes(form.start);
  const canSave = form.title.trim().length > 0 && !invalidRange;

  return (
    <ModalShell onClose={onClose} title={editing ? "Edit schedule" : "Add schedule"} icon={CalendarDays}>
      <div className="space-y-4">
        <Field label="Title">
          <input autoFocus value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Team meeting"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-teal-500" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Day">
            <select value={form.day} onChange={(e) => set({ day: Number(e.target.value) })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-teal-500">
              {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => set({ category: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-teal-500">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start time">
            <input type="time" value={form.start} onChange={(e) => set({ start: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-teal-500" />
          </Field>
          <Field label="End time">
            <input type="time" value={form.end} onChange={(e) => set({ end: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-teal-500" />
          </Field>
        </div>
        {invalidRange && <div className="text-xs text-rose-400 flex items-center gap-1.5"><AlertTriangle size={13} /> End time must be after start time.</div>}
        {!invalidRange && overlap && <div className="text-xs text-amber-400 flex items-center gap-1.5"><AlertTriangle size={13} /> This overlaps with another activity on this day.</div>}

        <Field label="Location (optional)">
          <input value={form.location} onChange={(e) => set({ location: e.target.value })} placeholder="e.g. Room 4B, Zoom"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-teal-500" />
        </Field>

        <Field label="Description (optional)">
          <textarea rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-teal-500 resize-none" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Repeat">
            <select value={form.repeat} onChange={(e) => set({ repeat: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-teal-500">
              {REPEAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Reminder">
            <select value={form.reminder} onChange={(e) => set({ reminder: Number(e.target.value) })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-teal-500">
              {NOTIFY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-neutral-800">
        <button onClick={onClose} className="px-4 py-2 rounded-md border border-neutral-800 hover:border-neutral-700 text-sm font-medium text-neutral-300">Cancel</button>
        <button
          disabled={!canSave}
          onClick={() => onSave({ ...form, id: editing?.id })}
          className="px-4 py-2 rounded-md bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 text-sm font-medium"
        >
          Save
        </button>
      </div>
    </ModalShell>
  );
}
