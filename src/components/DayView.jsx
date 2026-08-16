import React from "react";
import { MapPin, Repeat, AlertTriangle, Copy, Edit, Trash2 } from "lucide-react";
import { REPEAT_OPTIONS } from "../lib/constants.js";
import { toMinutes, formatTime, catInfo, daysForSchedule, isSameDate, checkOverlap, weekdayIndexMonday } from "../lib/utils.js";

export default function DayView({ date, schedules, categories, settings, now, onEdit, onDelete, onDuplicate, onAdd }) {
  const dow = weekdayIndexMonday(date);
  const isToday = isSameDate(date, now);
  const list = schedules
    .filter((s) => daysForSchedule(s).includes(dow))
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg divide-y divide-neutral-800">
      {list.length === 0 && (
        <div className="p-8 text-center text-sm text-neutral-500">
          Nothing scheduled this day.
          <button onClick={() => onAdd(dow)} className="block mx-auto mt-3 text-teal-400 hover:text-teal-300 text-sm font-medium">+ Add a schedule</button>
        </div>
      )}
      {list.map((s) => {
        const cat = catInfo(categories, s.category);
        const nowMin = now.getHours() * 60 + now.getMinutes();
        const isCurrent = isToday && toMinutes(s.start) <= nowMin && nowMin < toMinutes(s.end);
        const overlap = checkOverlap(list, dow, s.start, s.end, s.id);
        return (
          <div key={s.id} className={`flex items-start gap-3 px-4 py-3 group ${isCurrent ? "bg-teal-500/5" : ""}`}>
            <div className={`w-1.5 self-stretch rounded-full ${cat.dot}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{s.title}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${cat.soft} ${cat.text} font-medium`}>{cat.name}</span>
                {isCurrent && <span className="text-[10px] uppercase tracking-wide bg-teal-500 text-neutral-950 px-1.5 py-0.5 rounded font-semibold">Now</span>}
                {overlap && <span className="text-[10px] flex items-center gap-1 text-amber-400"><AlertTriangle size={11} /> Overlap</span>}
              </div>
              <div className="text-xs font-mono text-neutral-400 mt-1">{formatTime(s.start, settings.timeFormat24)} – {formatTime(s.end, settings.timeFormat24)}</div>
              {s.location && <div className="text-xs text-neutral-500 flex items-center gap-1 mt-1"><MapPin size={11} />{s.location}</div>}
              {s.description && <div className="text-xs text-neutral-500 mt-1">{s.description}</div>}
              {s.repeat !== "once" && <div className="text-[11px] text-neutral-600 flex items-center gap-1 mt-1"><Repeat size={11} />{REPEAT_OPTIONS.find(r => r.value === s.repeat)?.label}</div>}
            </div>
            <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button onClick={() => onDuplicate(s)} className="p-1.5 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800"><Copy size={13} /></button>
              <button onClick={() => onEdit(s)} className="p-1.5 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800"><Edit size={13} /></button>
              <button onClick={() => onDelete(s)} className="p-1.5 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-800"><Trash2 size={13} /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
