# Agenda — Schedule & Reminder App

A sleek, dark-themed weekly schedule and reminder manager built with React, Vite, Tailwind CSS, Lucide icons, Express, and Web Push notifications.

---

## Features

- **Dashboard**: Quick overview of today's schedule, upcoming reminders, and day timeline.
- **Weekly Schedule & Day View**: Interactive scheduling with overlap detection, custom tags, and categories.
- **Smart Reminders**: Priority levels, recurring triggers, and completion tracking.
- **Data Persistence**: Automatic local storage caching with JSON export/import backup support.
- **Web Push Notifications**: Background notifications powered by Service Workers and VAPID Web Push (even when the tab is closed).
- **Express Backend & Rate Limiting**: Built-in API server with endpoint rate limiting to prevent spam and abuse.

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (VAPID)

Generate permanent VAPID keys for push notifications:

```bash
npm run generate-vapid
```

Create a `.env` file in the project root:

```env
VAPID_PUBLIC_KEY=your_generated_public_key
VAPID_PRIVATE_KEY=your_generated_private_key
VAPID_SUBJECT=mailto:your-email@example.com
```

### 3. Run Locally

```bash
npm run dev
```

This starts both the Vite client (`http://localhost:5173`) and the Express server (`http://localhost:3001`) concurrently.

---

## Production Build & Deployment

### Build the frontend:

```bash
npm run build
```

### Start the production server:

```bash
npm start
```

### Deploying to Render

1. Create a new **Web Service** on Render connected to this repository.
2. Set the following build and start settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add your environment variables in the Render Dashboard:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` (must start with `mailto:` or `https://`)

---

## Project Structure

```
├── public/
│   ├── icon.svg                 App icon
│   ├── manifest.json            PWA web app manifest
│   └── sw.js                    Service Worker for handling background push
├── server/
│   ├── index.js                 Express API server & static file host
│   ├── notificationScheduler.js 30s background notification scheduler
│   ├── store.js                 In-memory device subscription store
│   └── utils.js                 Server-side schedule & reminder due-date checkers
├── scripts/
│   └── generate-vapid.js        CLI utility to generate VAPID keypairs
├── src/
│   ├── main.jsx                 Client entry point
│   ├── App.jsx                  Top-level state, routing, data sync & modals
│   ├── index.css                Tailwind CSS entry
│   ├── lib/
│   │   ├── constants.js         Categories, repeat/notify options, palette
│   │   ├── pushNotifications.js Web Push subscription & permission helpers
│   │   ├── seedData.js          Initial demo schedules/reminders
│   │   └── utils.js             Date/time helpers, export/import, formatting
│   └── components/
│       ├── Dashboard.jsx        Today's schedule + upcoming reminders
│       ├── SchedulePage.jsx     Week grid view
│       ├── DayView.jsx          Single-day list view
│       ├── RemindersPage.jsx    Reminders list
│       ├── SettingsPage.jsx     Push notifications, VAPID testing, JSON backup/restore
│       ├── ScheduleModal.jsx    Add/edit schedule form
│       ├── ReminderModal.jsx    Add/edit reminder form
│       ├── ModalShell.jsx       Shared modal chrome + confirm dialog
│       ├── Navigation.jsx       Sidebar and mobile navigation
│       ├── OnboardingTour.jsx   Interactive tour for new users
│       └── Toasts.jsx           In-app toast notifications fallback
├── .env.example                 Template for environment variables
├── render.yaml                  Render infrastructure specification
├── package.json                 Dependencies and npm scripts
└── vite.config.js               Vite build and API proxy config
```

---

## License

MIT License
