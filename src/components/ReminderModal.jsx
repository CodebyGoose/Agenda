import React, { useState } from "react";
import { Bell } from "lucide-react";
import { ModalShell, Field } from "./ModalShell.jsx";
import { REMINDER_REPEAT_OPTIONS, NOTIFY_OPTIONS } from "../lib/constants.js";
import { dateKey } from "../lib/utils.js";

export default function ReminderModal({ data, settings, onClose, onSave }) {
  const editing = data.editing;
  const [form, setForm] = useState(() => editing ? { ...editing } : {
    title: "", date: dateKey(new Date()), time: "09:00", notes: "", repeat: "once", notifyBefore: settings.defaultReminder,
  });
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const canSave = form.title.trim().length > 0 && form.date && form.time;

  return (
    <ModalShell onClose={onClose} title={editing ? "Edit reminder" : "Add reminder"} icon={Bell}>
      <div className="space-y-4">
        <Field label="Title">
          <input autoFocus value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Pay rent"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-teal-500" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input type="date" value={form.date} onChange={(e) => set({ date: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-teal-500" />
          </Field>
          <Field label="Time">
            <input type="time" value={form.time} onChange={(e) => set({ time: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-teal-500" />
          </Field>
        </div>
        <Field label="Notes (optional)">
          <textarea rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-teal-500 resize-none" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Repeat">
            <select value={form.repeat} onChange={(e) => set({ repeat: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-teal-500">
              {REMINDER_REPEAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Notify">
            <select value={form.notifyBefore} onChange={(e) => set({ notifyBefore: Number(e.target.value) })}
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
