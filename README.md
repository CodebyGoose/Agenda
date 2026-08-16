# Timeline — Schedule & Reminder App

A dark-themed weekly schedule and reminder manager built with React, Vite, Tailwind CSS, and Lucide icons.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL. To build for production:

```bash
npm run build
```

## Project structure

```
src/
  main.jsx                 entry point
  index.css                Tailwind entry
  App.jsx                  top-level state, routing between views, modals
  lib/
    constants.js            categories, repeat/notify options, palette
    utils.js                date/time helpers, overlap detection, reminder scheduling
    seedData.js              initial demo schedules/reminders
  components/
    Navigation.jsx           sidebar, mobile nav, bottom nav
    Dashboard.jsx             today's schedule + upcoming reminders
    SchedulePage.jsx          week grid view
    DayView.jsx               single-day list view
    RemindersPage.jsx         reminders list
    SettingsPage.jsx          time format, notifications, categories
    ScheduleModal.jsx         add/edit schedule form
    ReminderModal.jsx         add/edit reminder form
    ModalShell.jsx             shared modal chrome + confirm dialog
    Toasts.jsx                 in-app notification fallback
```

## Notes

- Data currently lives in React state (in-memory) — it resets on refresh.
  Swap `lib/seedData.js` + the `setSchedules` / `setReminders` calls in `App.jsx`
  for real API calls (or `localStorage`) to persist it.
- Browser notifications are requested on load; if denied or unsupported, the app
  falls back to in-app toasts automatically.
