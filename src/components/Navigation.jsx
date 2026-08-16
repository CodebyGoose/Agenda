import React from "react";
import { CalendarClock, Plus, Menu } from "lucide-react";

export function Sidebar({ nav, view, setView, onAddSchedule, onAddReminder }) {
  return (
    <aside className="hidden md:flex md:w-60 md:flex-col border-r border-neutral-800 bg-neutral-950 shrink-0">
      <div className="px-5 py-5 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-teal-500 flex items-center justify-center">
            <CalendarClock size={18} className="text-neutral-950" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-none">Timeline</div>
            <div className="text-[11px] text-neutral-500 leading-none mt-1">schedule & reminders</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((n) => (
          <button
            key={n.id}
            onClick={() => setView(n.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              view === n.id ? "bg-neutral-900 text-teal-400 border border-neutral-800" : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/60 border border-transparent"
            }`}
          >
            <n.icon size={16} />
            {n.label}
          </button>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-neutral-800 space-y-2">
        <button
          onClick={onAddSchedule}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-teal-500 hover:bg-teal-400 text-neutral-950 text-sm font-medium transition-colors"
        >
          <Plus size={15} /> Add schedule
        </button>
        <button
          onClick={onAddReminder}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-neutral-800 hover:border-neutral-700 text-sm font-medium text-neutral-200 transition-colors"
        >
          <Plus size={15} /> Add reminder
        </button>
      </div>
    </aside>
  );
}

export function MobileNav({ nav, view, setView, mobileNavOpen, setMobileNavOpen }) {
  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center">
            <CalendarClock size={15} className="text-neutral-950" />
          </div>
          <span className="text-sm font-semibold">Timeline</span>
        </div>
        <button onClick={() => setMobileNavOpen((v) => !v)} className="p-2 rounded-md border border-neutral-800 text-neutral-300">
          <Menu size={18} />
        </button>
      </div>
      {mobileNavOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-neutral-950 px-3 py-2 flex flex-col gap-1 sticky top-[49px] z-30">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => { setView(n.id); setMobileNavOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${view === n.id ? "bg-neutral-900 text-teal-400" : "text-neutral-400"}`}
            >
              <n.icon size={16} /> {n.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export function BottomNav({ nav, view, setView }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-neutral-950 border-t border-neutral-800 flex">
      {nav.map((n) => (
        <button
          key={n.id}
          onClick={() => setView(n.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] ${view === n.id ? "text-teal-400" : "text-neutral-500"}`}
        >
          <n.icon size={18} />
          {n.label}
        </button>
      ))}
    </nav>
  );
}
