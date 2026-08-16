import React from "react";
import { Clock, Bell, Palette, Globe, Info, BellRing, BellOff, Check, Plus, Trash2 } from "lucide-react";
import { CATEGORY_PALETTE, NOTIFY_OPTIONS } from "../lib/constants.js";
import { uid } from "../lib/utils.js";

export default function SettingsPage({ settings, setSettings, categories, setCategories, notifPermission, requestNotifPermission }) {
  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));

  const updateCategoryColor = (id, color) => {
    setCategories((cats) => cats.map((c) => (c.id === id ? { ...c, color } : c)));
  };
  const updateCategoryName = (id, name) => {
    setCategories((cats) => cats.map((c) => (c.id === id ? { ...c, name } : c)));
  };
  const addCategory = () => {
    const id = uid();
    setCategories((cats) => [...cats, { id, name: "New category", color: CATEGORY_PALETTE[cats.length % CATEGORY_PALETTE.length].key }]);
  };
  const removeCategory = (id) => setCategories((cats) => cats.filter((c) => c.id !== id));

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold mb-2">Settings</h1>

      <SettingsSection icon={Clock} title="Time & week">
        <SettingRow label="Time format" description="Choose how times are displayed throughout the app.">
          <ToggleGroup
            value={settings.timeFormat24 ? "24" : "12"}
            options={[{ value: "12", label: "12-hour" }, { value: "24", label: "24-hour" }]}
            onChange={(v) => update({ timeFormat24: v === "24" })}
          />
        </SettingRow>
        <SettingRow label="First day of week" description="Which day starts the weekly schedule view.">
          <ToggleGroup
            value={settings.firstDayMonday ? "mon" : "sun"}
            options={[{ value: "mon", label: "Monday" }, { value: "sun", label: "Sunday" }]}
            onChange={(v) => update({ firstDayMonday: v === "mon" })}
          />
        </SettingRow>
        <SettingRow label="Default reminder time" description="Applied when creating a new schedule.">
          <select
            value={settings.defaultReminder}
            onChange={(e) => update({ defaultReminder: Number(e.target.value) })}
            className="bg-neutral-950 border border-neutral-800 rounded-md px-2.5 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-teal-500"
          >
            {NOTIFY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </SettingRow>
      </SettingsSection>

      <SettingsSection icon={Bell} title="Notifications">
        <SettingRow label="Browser notifications" description="Get notified before schedules start and reminders are due.">
          <button
            onClick={() => update({ notificationsEnabled: !settings.notificationsEnabled })}
            className={`w-11 h-6 rounded-full relative transition-colors ${settings.notificationsEnabled ? "bg-teal-500" : "bg-neutral-800"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-neutral-100 transition-transform ${settings.notificationsEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </SettingRow>
        <SettingRow
          label="Permission status"
          description={
            notifPermission === "granted" ? "Browser notifications are allowed." :
            notifPermission === "denied" ? "Browser notifications are blocked. In-app alerts will be used instead." :
            notifPermission === "unsupported" ? "This browser does not support notifications. In-app alerts will be used instead." :
            "Not yet granted."
          }
        >
          {notifPermission === "default" && (
            <button onClick={requestNotifPermission} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-500 hover:bg-teal-400 text-neutral-950 text-xs font-medium">
              <BellRing size={13} /> Enable
            </button>
          )}
          {notifPermission === "granted" && <span className="flex items-center gap-1.5 text-xs text-teal-400"><Check size={13} /> Granted</span>}
          {notifPermission === "denied" && <span className="flex items-center gap-1.5 text-xs text-rose-400"><BellOff size={13} /> Blocked</span>}
        </SettingRow>
      </SettingsSection>

      <SettingsSection icon={Palette} title="Categories">
        <div className="space-y-2">
          {categories.map((c) => {
            return (
              <div key={c.id} className="flex items-center gap-2">
                <input
                  value={c.name}
                  onChange={(e) => updateCategoryName(c.id, e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-md px-2.5 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-teal-500"
                />
                <div className="flex items-center gap-1">
                  {CATEGORY_PALETTE.map((pl) => (
                    <button
                      key={pl.key}
                      onClick={() => updateCategoryColor(c.id, pl.key)}
                      className={`w-6 h-6 rounded-full ${pl.dot} ${c.color === pl.key ? "ring-2 ring-offset-2 ring-offset-neutral-900 ring-neutral-100" : ""}`}
                    />
                  ))}
                </div>
                <button onClick={() => removeCategory(c.id)} className="p-1.5 text-neutral-600 hover:text-rose-400"><Trash2 size={14} /></button>
              </div>
            );
          })}
          <button onClick={addCategory} className="flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 mt-1">
            <Plus size={14} /> Add category
          </button>
        </div>
      </SettingsSection>

      <SettingsSection icon={Globe} title="Appearance">
        <SettingRow label="Theme" description="This app uses a fixed dark theme for focus and consistency.">
          <span className="text-xs text-neutral-500 px-3 py-1.5 border border-neutral-800 rounded-md">Dark</span>
        </SettingRow>
      </SettingsSection>

      <div className="flex items-start gap-2 text-xs text-neutral-600 px-1">
        <Info size={13} className="mt-0.5 shrink-0" />
        <span>Connect a backend or database to persist schedules and reminders across sessions and devices.</span>
      </div>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, children }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
        <Icon size={15} className="text-teal-400" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="max-w-xs">
        <div className="text-sm font-medium text-neutral-200">{label}</div>
        {description && <div className="text-xs text-neutral-500 mt-0.5">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ToggleGroup({ value, options, onChange }) {
  return (
    <div className="flex bg-neutral-950 border border-neutral-800 rounded-md p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded text-xs font-medium ${value === o.value ? "bg-teal-500 text-neutral-950" : "text-neutral-400"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
