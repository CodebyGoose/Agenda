import React, { useMemo } from "react";
import { CalendarDays, Bell, Plus, Clock, Edit, Trash2, ArrowRight, Sunrise, MapPin } from "lucide-react";
import { toMinutes, formatTime, catInfo, daysForSchedule, weekdayIndexMonday, getReminderNextOccurrence } from "../lib/utils.js";

export default function Dashboard({ now, schedules, reminders, categories, settings, tutorialSteps, onAddSchedule, onAddReminder, onEditReminder, onDeleteReminder, onGoSchedule, onGoReminders }) {
  const dow = weekdayIndexMonday(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const todays = useMemo(() => {
    return schedules
      .filter((s) => daysForSchedule(s).includes(dow))
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }, [schedules, dow]);

  const current = todays.find((s) => toMinutes(s.start) <= nowMin && nowMin < toMinutes(s.end));
  const upcoming = todays.find((s) => toMinutes(s.start) > nowMin);

  const upcomingReminders = useMemo(() => {
    return [...reminders]
      .map((r) => ({ r, occ: getReminderNextOccurrence(r, now) }))
      .sort((a, b) => a.occ - b.occ)
      .slice(0, 5);
  }, [reminders, now]);

  const dateStr = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wide text-teal-400 font-medium">{dateStr}</div>
          <h1 className="text-2xl font-semibold mt-1">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={onAddSchedule} className="flex items-center gap-2 px-3 py-2 rounded-md bg-teal-500 hover:bg-teal-400 text-neutral-950 text-sm font-medium">
            <Plus size={15} /> Add schedule
          </button>
          <button onClick={onAddReminder} className="flex items-center gap-2 px-3 py-2 rounded-md border border-neutral-800 hover:border-neutral-700 text-sm font-medium text-neutral-200">
            <Plus size={15} /> Add reminder
          </button>
        </div>
      </div>

      {schedules.length === 0 && reminders.length === 0 && (
        <div className="mb-5 border border-teal-500/30 bg-teal-500/5 rounded-lg p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-teal-400 font-medium">Tutorial</div>
              <h2 className="text-lg font-semibold mt-1">Get started in 3 quick steps</h2>
            </div>
            <button onClick={onAddSchedule} className="flex items-center gap-2 px-3 py-2 rounded-md bg-teal-500 hover:bg-teal-400 text-neutral-950 text-sm font-medium">
              <Plus size={15} /> Add your first schedule
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tutorialSteps.map((step, index) => (
              <div key={step.title} className="rounded-md border border-neutral-800 bg-neutral-900/60 p-3">
                <div className="text-[10px] uppercase tracking-wide text-neutral-500 mb-2">Step {index + 1}</div>
                <div className="text-sm font-medium text-neutral-100">{step.title}</div>
                <div className="text-xs text-neutral-500 mt-1">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <StatCard icon={Sunrise} label="Today" value={`${todays.length} activities`} />
        <StatCard icon={Clock} label="Right now" value={current ? current.title : "Free"} accent={!!current} />
        <StatCard
          icon={ArrowRight}
          label="Up next"
          value={upcoming ? `${upcoming.title} · ${formatTime(upcoming.start, settings.timeFormat24)}` : "Nothing else today"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <h2 className="text-sm font-semibold flex items-center gap-2"><CalendarDays size={15} className="text-teal-400" /> Today's schedule</h2>
            <button onClick={onGoSchedule} className="text-xs text-neutral-500 hover:text-neutral-200">View all</button>
          </div>
          <div className="divide-y divide-neutral-800">
            {todays.length === 0 && <div className="p-6 text-sm text-neutral-500">Nothing planned today. Add a schedule to get started.</div>}
            {todays.map((s) => {
              const cat = catInfo(categories, s.category);
              const isCurrent = current && current.id === s.id;
              const isNext = upcoming && upcoming.id === s.id;
              return (
                <div key={s.id} className={`flex items-center gap-3 px-4 py-3 ${isCurrent ? "bg-teal-500/5" : ""}`}>
                  <div className={`w-1.5 h-9 rounded-full ${cat.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{s.title}</span>
                      {isCurrent && <span className="text-[10px] uppercase tracking-wide bg-teal-500 text-neutral-950 px-1.5 py-0.5 rounded font-semibold shrink-0">Now</span>}
                      {isNext && !isCurrent && <span className="text-[10px] uppercase tracking-wide border border-neutral-700 text-neutral-400 px-1.5 py-0.5 rounded font-semibold shrink-0">Next</span>}
                    </div>
                    {s.location && <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5"><MapPin size={11} />{s.location}</div>}
                  </div>
                  <div className="text-xs font-mono text-neutral-400 shrink-0">
                    {formatTime(s.start, settings.timeFormat24)} – {formatTime(s.end, settings.timeFormat24)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Bell size={15} className="text-teal-400" /> Upcoming reminders</h2>
            <button onClick={onGoReminders} className="text-xs text-neutral-500 hover:text-neutral-200">View all</button>
          </div>
          <div className="divide-y divide-neutral-800">
            {upcomingReminders.length === 0 && <div className="p-6 text-sm text-neutral-500">No reminders yet.</div>}
            {upcomingReminders.map(({ r, occ }) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3 group">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="text-xs text-neutral-500 font-mono mt-0.5">
                    {occ.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {formatTime(r.time, settings.timeFormat24)}
                  </div>
                </div>
                <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                  <button onClick={() => onEditReminder(r)} className="p-1.5 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800"><Edit size={13} /></button>
                  <button onClick={() => onDeleteReminder(r)} className="p-1.5 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-800"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className={`bg-neutral-900 border rounded-lg p-4 ${accent ? "border-teal-500/40" : "border-neutral-800"}`}>
      <div className="flex items-center gap-2 text-neutral-500 text-xs mb-2">
        <Icon size={14} className={accent ? "text-teal-400" : ""} />
        {label}
      </div>
      <div className={`text-sm font-semibold truncate ${accent ? "text-teal-400" : "text-neutral-100"}`}>{value}</div>
    </div>
  );
}
