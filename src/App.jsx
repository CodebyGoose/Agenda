import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { LayoutDashboard, CalendarDays, Bell, Settings as SettingsIcon } from "lucide-react";

import { Sidebar, MobileNav, BottomNav } from "./components/Navigation.jsx";
import Dashboard from "./components/Dashboard.jsx";
import SchedulePage from "./components/SchedulePage.jsx";
import RemindersPage from "./components/RemindersPage.jsx";
import SettingsPage from "./components/SettingsPage.jsx";
import ScheduleModal from "./components/ScheduleModal.jsx";
import ReminderModal from "./components/ReminderModal.jsx";
import { ConfirmModal } from "./components/ModalShell.jsx";
import Toasts from "./components/Toasts.jsx";

import { DEFAULT_CATEGORIES } from "./lib/constants.js";
import { tutorialSteps } from "./lib/seedData.js";
import { uid, toMinutes, daysForSchedule, startOfWeek, addDays, dateKey, weekdayIndexMonday, getReminderNextOccurrence } from "./lib/utils.js";

export default function App() {
  const [view, setView] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [schedules, setSchedules] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [settings, setSettings] = useState({
    timeFormat24: false,
    notificationsEnabled: true,
    defaultReminder: 10,
    firstDayMonday: true,
  });

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const requestNotifPermission = useCallback(() => {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().then(setNotifPermission);
  }, []);
  useEffect(() => {
    if (settings.notificationsEnabled && typeof Notification !== "undefined" && Notification.permission === "default") {
      requestNotifPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [toasts, setToasts] = useState([]);
  const pushToast = useCallback((title, body) => {
    const id = uid();
    setToasts((t) => [...t, { id, title, body }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  }, []);

  const firedRef = useRef(new Set());
  useEffect(() => {
    if (!settings.notificationsEnabled) return;
    const nowDow = weekdayIndexMonday(now);
    schedules.forEach((s) => {
      if (!daysForSchedule(s).includes(nowDow)) return;
      const startMin = toMinutes(s.start);
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const notifyAt = startMin - s.reminder;
      const fireKey = `sched-${s.id}-${dateKey(now)}`;
      if (Math.abs(nowMin - notifyAt) <= 1 && !firedRef.current.has(fireKey)) {
        firedRef.current.add(fireKey);
        const msg = s.reminder === 0 ? `Starting now${s.location ? " · " + s.location : ""}` : `Starts in ${s.reminder} min${s.location ? " · " + s.location : ""}`;
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(s.title, { body: msg });
        } else {
          pushToast(s.title, msg);
        }
      }
    });
    reminders.forEach((r) => {
      const occ = getReminderNextOccurrence(r, now);
      const notifyAt = new Date(occ.getTime() - r.notifyBefore * 60000);
      const diffSec = Math.abs((notifyAt.getTime() - now.getTime()) / 1000);
      const fireKey = `rem-${r.id}-${occ.toISOString().slice(0, 16)}`;
      if (diffSec <= 30 && !firedRef.current.has(fireKey)) {
        firedRef.current.add(fireKey);
        const msg = r.notifyBefore === 0 ? "Due now" : `Due in ${r.notifyBefore} min`;
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(r.title, { body: msg });
        } else {
          pushToast(r.title, msg);
        }
      }
    });
  }, [now, schedules, reminders, settings.notificationsEnabled, pushToast]);

  /* ---- schedule / reminder CRUD ---- */

  const [scheduleModal, setScheduleModal] = useState(null); // { editing, defaultDay }
  const [reminderModal, setReminderModal] = useState(null); // { editing }
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, id, label }

  const saveSchedule = (data) => {
    if (data.id) {
      setSchedules((list) => list.map((s) => (s.id === data.id ? data : s)));
    } else {
      setSchedules((list) => [...list, { ...data, id: uid() }]);
    }
    setScheduleModal(null);
  };
  const deleteSchedule = (id) => setSchedules((list) => list.filter((s) => s.id !== id));
  const duplicateSchedule = (s) => setSchedules((list) => [...list, { ...s, id: uid(), title: s.title + " (copy)" }]);
  const moveSchedule = (id, newDay) => setSchedules((list) => list.map((s) => (s.id === id ? { ...s, day: newDay } : s)));

  const saveReminder = (data) => {
    if (data.id) {
      setReminders((list) => list.map((r) => (r.id === data.id ? data : r)));
    } else {
      setReminders((list) => [...list, { ...data, id: uid() }]);
    }
    setReminderModal(null);
  };
  const deleteReminder = (id) => setReminders((list) => list.filter((r) => r.id !== id));

  /* ---- schedule view state ---- */
  const [scheduleViewMode, setScheduleViewMode] = useState("week"); // 'week' | 'day'
  const [anchorDate, setAnchorDate] = useState(new Date());

  const weekStart = useMemo(() => startOfWeek(anchorDate, settings.firstDayMonday), [anchorDate, settings.firstDayMonday]);
  const weekDates = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) arr.push(addDays(weekStart, i));
    return arr;
  }, [weekStart]);
  const displayDayIndices = useMemo(() => weekDates.map((d) => weekdayIndexMonday(d)), [weekDates]);

  const todayDow = weekdayIndexMonday(now);

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "schedule", label: "Schedule", icon: CalendarDays },
    { id: "reminders", label: "Reminders", icon: Bell },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans overflow-x-hidden">
      <Sidebar
        nav={nav}
        view={view}
        setView={setView}
        onAddSchedule={() => setScheduleModal({ editing: null, defaultDay: todayDow })}
        onAddReminder={() => setReminderModal({ editing: null })}
      />

      <MobileNav nav={nav} view={view} setView={setView} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />

      <main className="flex-1 min-w-0 w-full pb-20 md:pb-0 overflow-y-auto overflow-x-hidden">
        {view === "dashboard" && (
          <Dashboard
            now={now}
            schedules={schedules}
            reminders={reminders}
            categories={categories}
            settings={settings}
            tutorialSteps={tutorialSteps}
            onAddSchedule={() => setScheduleModal({ editing: null, defaultDay: todayDow })}
            onAddReminder={() => setReminderModal({ editing: null })}
            onEditReminder={(r) => setReminderModal({ editing: r })}
            onDeleteReminder={(r) => setConfirmDelete({ type: "reminder", id: r.id, label: r.title })}
            onGoSchedule={() => setView("schedule")}
            onGoReminders={() => setView("reminders")}
          />
        )}

        {view === "schedule" && (
          <SchedulePage
            settings={settings}
            categories={categories}
            schedules={schedules}
            tutorialSteps={tutorialSteps}
            viewMode={scheduleViewMode}
            setViewMode={setScheduleViewMode}
            anchorDate={anchorDate}
            setAnchorDate={setAnchorDate}
            weekDates={weekDates}
            displayDayIndices={displayDayIndices}
            todayDow={todayDow}
            now={now}
            onAdd={(day) => setScheduleModal({ editing: null, defaultDay: day })}
            onEdit={(s) => setScheduleModal({ editing: s, defaultDay: s.day })}
            onDelete={(s) => setConfirmDelete({ type: "schedule", id: s.id, label: s.title })}
            onDuplicate={duplicateSchedule}
            onMove={moveSchedule}
          />
        )}

        {view === "reminders" && (
          <RemindersPage
            reminders={reminders}
            now={now}
            settings={settings}
            tutorialSteps={tutorialSteps}
            onAdd={() => setReminderModal({ editing: null })}
            onEdit={(r) => setReminderModal({ editing: r })}
            onDelete={(r) => setConfirmDelete({ type: "reminder", id: r.id, label: r.title })}
          />
        )}

        {view === "settings" && (
          <SettingsPage
            settings={settings}
            setSettings={setSettings}
            categories={categories}
            setCategories={setCategories}
            notifPermission={notifPermission}
            requestNotifPermission={requestNotifPermission}
          />
        )}
      </main>

      <BottomNav nav={nav} view={view} setView={setView} />

      {scheduleModal && (
        <ScheduleModal
          data={scheduleModal}
          categories={categories}
          schedules={schedules}
          settings={settings}
          onClose={() => setScheduleModal(null)}
          onSave={saveSchedule}
        />
      )}
      {reminderModal && (
        <ReminderModal
          data={reminderModal}
          settings={settings}
          onClose={() => setReminderModal(null)}
          onSave={saveReminder}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          label={confirmDelete.label}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            if (confirmDelete.type === "schedule") deleteSchedule(confirmDelete.id);
            else deleteReminder(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}

      <Toasts toasts={toasts} dismiss={(id) => setToasts((ts) => ts.filter((x) => x.id !== id))} />
    </div>
  );
}
