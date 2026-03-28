"use client";

import { useState } from "react";
import { Save, School, Globe, Wallet, Calendar, Mail, Phone, MapPin } from "lucide-react";
import { updateSettingsAction } from "./actions";

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState(
    initialSettings || {
      schoolName: "My School",
      schoolAddress: "",
      contactEmail: "",
      contactPhone: "",
      academicYear: "2024-2025",
      currencySymbol: "$",
      timezone: "UTC",
    }
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`,
  ];

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    const res = await updateSettingsAction(formData);

    if (res.success) {
      setSettings(res.setting);
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to save settings." });
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl max-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Global Settings</h1>
        <p className="mt-2 text-gray-500 dark:text-zinc-400">
          Manage your school's core configurations and localization preferences.
        </p>
      </div>

      {message.text && (
        <div
          className={`mb-6 flex items-center justify-between rounded-lg border p-4 text-sm font-medium ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {message.text}
          <button onClick={() => setMessage({ type: "", text: "" })} className="opacity-70 hover:opacity-100">
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
            <School className="text-blue-600 dark:text-blue-400" size={20} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">School Profile</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-zinc-300">
                School Name *
              </label>
              <input
                type="text"
                required
                name="schoolName"
                value={settings.schoolName}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="E.g., Springfield Elementary School"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                <Mail size={16} className="text-gray-400" /> Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="admin@school.com"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                <Phone size={16} className="text-gray-400" /> Contact Phone
              </label>
              <input
                type="text"
                name="contactPhone"
                value={settings.contactPhone}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                <MapPin size={16} className="text-gray-400" /> Complete Address
              </label>
              <input
                type="text"
                name="schoolAddress"
                value={settings.schoolAddress}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="123 Education Lane, Learning City, 12345"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
            <Globe className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Localization & System</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                <Calendar size={16} className="text-gray-400" /> Academic Year *
              </label>
              <select
                required
                name="academicYear"
                value={settings.academicYear}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                <Wallet size={16} className="text-gray-400" /> Currency Symbol *
              </label>
              <select
                required
                name="currencySymbol"
                value={settings.currencySymbol}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="$">$ (USD)</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="Rs. ">Rs. (INR)</option>
                <option value="JPY">JPY</option>
                <option value="A$">A$ (AUD)</option>
                <option value="C$">C$ (CAD)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                <Globe size={16} className="text-gray-400" /> Timezone *
              </label>
              <select
                required
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-gray-200 pt-4 dark:border-zinc-800">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:bg-blue-400 hover:bg-blue-700"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Save size={18} />
            )}
            {loading ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
