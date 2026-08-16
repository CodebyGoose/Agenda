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
import OnboardingTour from "./components/OnboardingTour.jsx";

import { DEFAULT_CATEGORIES } from "./lib/constants.js";
import { tutorialSteps } from "./lib/seedData.js";
import { uid, toMinutes, daysForSchedule, startOfWeek, addDays, dateKey, weekdayIndexMonday, getReminderNextOccurrence } from "./lib/utils.js";
import {
  registerServiceWorker,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  syncDataToServer,
  showLocalNotification,
  isPushSupported,
} from "./lib/pushNotifications.js";

export default function App() {
  const [view, setView] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("agenda_categories");
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });
  const [schedules, setSchedules] = useState(() => {
    try {
      const saved = localStorage.getItem("agenda_schedules");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem("agenda_reminders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState(() => {
    const defaultSettings = {
      timeFormat24: false,
      notificationsEnabled: true,
      defaultReminder: 10,
      firstDayMonday: true,
    };
    try {
      const saved = localStorage.getItem("agenda_settings");
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [showGuide, setShowGuide] = useState(() => {
    try {
      return !localStorage.getItem("agenda_hide_guide");
    } catch {
      return true;
    }
  });

  const closeGuide = () => {
    try {
      localStorage.setItem("agenda_hide_guide", "true");
    } catch (e) {}
    setShowGuide(false);
  };

  useEffect(() => {
    localStorage.setItem("agenda_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("agenda_schedules", JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem("agenda_reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem("agenda_settings", JSON.stringify(settings));
  }, [settings]);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const [notifPermission, setNotifPermission] = useState("default");
  const [pushSubscribed, setPushSubscribed] = useState(false);

  useEffect(() => {
    registerServiceWorker();
    getNotificationPermission().then(setNotifPermission);
    if (isPushSupported()) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setPushSubscribed(true);
        });
      });
    }
  }, []);

  const enableNotifications = useCallback(async () => {
    const result = await subscribeToPush();
    const permission = await getNotificationPermission();
    setNotifPermission(permission);
    setPushSubscribed(result.ok);
    await syncDataToServer({ schedules, reminders, settings });
    return result;
  }, [schedules, reminders, settings]);

  const disableNotifications = useCallback(async () => {
    await unsubscribeFromPush();
    setPushSubscribed(false);
  }, []);

  useEffect(() => {
    if (!settings.notificationsEnabled) {
      disableNotifications();
      return;
    }
    syncDataToServer({ schedules, reminders, settings });
  }, [schedules, reminders, settings, settings.notificationsEnabled, disableNotifications]);

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
        showLocalNotification(s.title, msg).then((shown) => {
          if (!shown) pushToast(s.title, msg);
        });
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
        showLocalNotification(r.title, msg).then((shown) => {
          if (!shown) pushToast(r.title, msg);
        });
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
            pushSubscribed={pushSubscribed}
            pushSupported={isPushSupported()}
            enableNotifications={enableNotifications}
            schedules={schedules}
            setSchedules={setSchedules}
            reminders={reminders}
            setReminders={setReminders}
            pushToast={pushToast}
            onShowGuide={() => setShowGuide(true)}
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
          onDelete={(id) => {
            setScheduleModal(null);
            setConfirmDelete({ type: "schedule", id, label: scheduleModal.editing?.title });
          }}
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

      {showGuide && <OnboardingTour onClose={closeGuide} />}
    </div>
  );
}
