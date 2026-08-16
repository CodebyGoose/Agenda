import React from "react";
import { CalendarDays, Plus, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import DayView from "./DayView.jsx";
import { DAY_SHORT, DAY_START_MIN, DAY_END_MIN, PX_PER_MIN } from "../lib/constants.js";
import { toMinutes, formatTime, catInfo, daysForSchedule, isSameDate, checkOverlap, addDays } from "../lib/utils.js";

export default function SchedulePage({ settings, categories, schedules, tutorialSteps, viewMode, setViewMode, anchorDate, setAnchorDate, weekDates, displayDayIndices, todayDow, now, onAdd, onEdit, onDelete, onDuplicate, onMove }) {
  const goPrev = () => setAnchorDate((d) => addDays(d, viewMode === "week" ? -7 : -1));
  const goNext = () => setAnchorDate((d) => addDays(d, viewMode === "week" ? 7 : 1));
  const goToday = () => setAnchorDate(new Date());

  const rangeLabel = viewMode === "week"
    ? `${weekDates[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${weekDates[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
    : anchorDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const totalMin = DAY_END_MIN - DAY_START_MIN;
  const hourMarks = [];
  for (let h = 6; h <= 24; h++) hourMarks.push(h);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <h1 className="text-2xl font-semibold">Schedule</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-neutral-900 border border-neutral-800 rounded-md p-0.5">
            <button onClick={() => setViewMode("week")} className={`px-3 py-1.5 rounded text-xs font-medium ${viewMode === "week" ? "bg-teal-500 text-neutral-950" : "text-neutral-400"}`}>Week</button>
            <button onClick={() => setViewMode("day")} className={`px-3 py-1.5 rounded text-xs font-medium ${viewMode === "day" ? "bg-teal-500 text-neutral-950" : "text-neutral-400"}`}>Day</button>
          </div>
          <button onClick={() => onAdd(todayDow)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-teal-500 hover:bg-teal-400 text-neutral-950 text-sm font-medium">
            <Plus size={15} /> Add schedule
          </button>
        </div>
      </div>

      {schedules.length === 0 && (
        <div className="mb-5 border border-neutral-800 bg-neutral-900 rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-teal-400 font-medium">Tutorial</div>
          <div className="mt-2 text-sm text-neutral-300">{tutorialSteps[0].title}: {tutorialSteps[0].description}</div>
          <div className="mt-2 text-xs text-neutral-500">Use the Add schedule button to create your first item and fill in the time, day, and details.</div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <button onClick={goPrev} className="p-2 rounded-md border border-neutral-800 hover:border-neutral-700 text-neutral-300"><ChevronLeft size={16} /></button>
          <button onClick={goNext} className="p-2 rounded-md border border-neutral-800 hover:border-neutral-700 text-neutral-300"><ChevronRight size={16} /></button>
          <button onClick={goToday} className="px-3 py-2 rounded-md border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 ml-1">Today</button>
        </div>
        <div className="text-sm text-neutral-400 font-medium">{rangeLabel}</div>
      </div>

      {viewMode === "week" ? (
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="min-w-[820px] grid grid-cols-[52px_repeat(7,1fr)] border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900">
            <div className="border-r border-b border-neutral-800 bg-neutral-950" />
            {weekDates.map((d, i) => {
              const isToday = isSameDate(d, now);
              return (
                <div key={i} className={`border-r border-b border-neutral-800 last:border-r-0 px-2 py-2 text-center ${isToday ? "bg-teal-500/10" : ""}`}>
                  <div className={`text-[11px] uppercase tracking-wide ${isToday ? "text-teal-400" : "text-neutral-500"}`}>{DAY_SHORT[displayDayIndices[i]]}</div>
                  <div className={`text-sm font-semibold ${isToday ? "text-teal-400" : "text-neutral-200"}`}>{d.getDate()}</div>
                </div>
              );
            })}

            <div className="relative border-r border-neutral-800" style={{ height: totalMin * PX_PER_MIN }}>
              {hourMarks.map((h) => (
                <div key={h} className="absolute right-1 -translate-y-1/2 text-[10px] text-neutral-600 font-mono" style={{ top: (h * 60 - DAY_START_MIN) * PX_PER_MIN }}>
                  {h % 24 === 0 ? "24" : h}
                </div>
              ))}
            </div>

            {displayDayIndices.map((dayIdx, colI) => {
              const dayDate = weekDates[colI];
              const isToday = isSameDate(dayDate, now);
              const daySchedules = schedules.filter((s) => daysForSchedule(s).includes(dayIdx));
              return (
                <div
                  key={colI}
                  className="relative border-r border-neutral-800 last:border-r-0"
                  style={{ height: totalMin * PX_PER_MIN }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) onMove(id, dayIdx);
                  }}
                >
                  {hourMarks.map((h) => (
                    <div key={h} className="absolute left-0 right-0 border-t border-neutral-800/60" style={{ top: (h * 60 - DAY_START_MIN) * PX_PER_MIN }} />
                  ))}
                  {isToday && now.getHours() * 60 + now.getMinutes() >= DAY_START_MIN && (
                    <div className="absolute left-0 right-0 h-px bg-teal-400 z-20" style={{ top: (now.getHours() * 60 + now.getMinutes() - DAY_START_MIN) * PX_PER_MIN }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 -mt-[3px]" />
                    </div>
                  )}
                  {daySchedules.map((s) => {
                    const cat = catInfo(categories, s.category);
                    const top = (toMinutes(s.start) - DAY_START_MIN) * PX_PER_MIN;
                    const height = Math.max((toMinutes(s.end) - toMinutes(s.start)) * PX_PER_MIN, 22);
                    const overlap = checkOverlap(schedules.filter((x) => daysForSchedule(x).includes(dayIdx)), dayIdx, s.start, s.end, s.id);
                    return (
                      <div
                        key={s.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", s.id)}
                        onClick={() => onEdit(s)}
                        className={`absolute left-1 right-1 rounded-md px-1.5 py-1 cursor-pointer border ${cat.border} ${cat.soft} hover:brightness-125 transition overflow-hidden`}
                        style={{ top, height }}
                        title={s.title}
                      >
                        <div className={`text-[11px] font-medium truncate ${cat.text}`}>{s.title}</div>
                        {height > 32 && <div className="text-[10px] text-neutral-400 font-mono truncate">{formatTime(s.start, settings.timeFormat24)}–{formatTime(s.end, settings.timeFormat24)}</div>}
                        {overlap && <AlertTriangle size={10} className="absolute top-1 right-1 text-amber-400" />}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <DayView
          date={anchorDate}
          schedules={schedules}
          categories={categories}
          settings={settings}
          now={now}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onAdd={onAdd}
        />
      )}
    </div>
  );
}
