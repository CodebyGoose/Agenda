import React, { useMemo } from "react";
import { Bell, Plus, Repeat, BellRing, Edit, Trash2 } from "lucide-react";
import { REMINDER_REPEAT_OPTIONS, NOTIFY_OPTIONS } from "../lib/constants.js";
import { formatTime, getReminderNextOccurrence } from "../lib/utils.js";

export default function RemindersPage({ reminders, now, settings, tutorialSteps, onAdd, onEdit, onDelete }) {
  const sorted = useMemo(() => {
    return [...reminders]
      .map((r) => ({ r, occ: getReminderNextOccurrence(r, now) }))
      .sort((a, b) => a.occ - b.occ);
  }, [reminders, now]);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Reminders</h1>
        <button onClick={onAdd} className="flex items-center gap-2 px-3 py-2 rounded-md bg-teal-500 hover:bg-teal-400 text-neutral-950 text-sm font-medium">
          <Plus size={15} /> Add reminder
        </button>
      </div>

      {reminders.length === 0 && (
        <div className="mb-5 border border-neutral-800 bg-neutral-900 rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-teal-400 font-medium">Tutorial</div>
          <div className="mt-2 text-sm text-neutral-300">{tutorialSteps[1].title}: {tutorialSteps[1].description}</div>
          <div className="mt-2 text-xs text-neutral-500">Create a reminder to track bills, tasks, or personal check-ins before they slip away.</div>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg divide-y divide-neutral-800">
        {sorted.length === 0 && <div className="p-8 text-center text-sm text-neutral-500">No reminders yet. Add one to stay on top of things.</div>}
        {sorted.map(({ r, occ }) => (
          <div key={r.id} className="flex items-start gap-3 px-4 py-3 group">
            <div className="w-8 h-8 rounded-md bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
              <Bell size={14} className="text-teal-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{r.title}</div>
              <div className="text-xs font-mono text-neutral-400 mt-1">
                {occ.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {formatTime(r.time, settings.timeFormat24)}
              </div>
              {r.notes && <div className="text-xs text-neutral-500 mt-1">{r.notes}</div>}
              <div className="flex items-center gap-3 mt-1.5">
                {r.repeat !== "once" && <span className="text-[11px] text-neutral-600 flex items-center gap-1"><Repeat size={11} />{REMINDER_REPEAT_OPTIONS.find(o => o.value === r.repeat)?.label}</span>}
                <span className="text-[11px] text-neutral-600 flex items-center gap-1"><BellRing size={11} />{NOTIFY_OPTIONS.find(o => o.value === r.notifyBefore)?.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(r)} className="p-1.5 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800"><Edit size={13} /></button>
              <button onClick={() => onDelete(r)} className="p-1.5 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-800"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
