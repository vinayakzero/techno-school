"use client";

import { useState } from "react";
import { Save, School, Globe, Wallet, Calendar, Mail, Phone, MapPin } from "lucide-react";
import { updateSettingsAction } from "./actions";

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState(initialSettings || {
    schoolName: "My School",
    schoolAddress: "",
    contactEmail: "",
    contactPhone: "",
    academicYear: "2024-2025",
    currencySymbol: "$",
    timezone: "UTC"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`
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
    "Australia/Sydney"
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
        <p className="text-gray-500 dark:text-zinc-400 mt-2">Manage your school's core configurations and localization preferences.</p>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg font-medium text-sm flex items-center justify-between ${
          message.type === "success" 
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
            : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
        }`}>
          {message.text}
          <button onClick={() => setMessage({ type: "", text: "" })} className="opacity-70 hover:opacity-100">&times;</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* General Profile Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 px-6 py-4 flex items-center gap-3">
            <School className="text-blue-600 dark:text-blue-400" size={20} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">School Profile</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">School Name *</label>
              <input 
                type="text" required name="schoolName" value={settings.schoolName} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                placeholder="E.g., Springfield Elementary School"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-gray-400" /> Contact Email
              </label>
              <input 
                type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                placeholder="admin@school.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-gray-400" /> Contact Phone
              </label>
              <input 
                type="text" name="contactPhone" value={settings.contactPhone} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" /> Complete Address
              </label>
              <input 
                type="text" name="schoolAddress" value={settings.schoolAddress} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                placeholder="123 Education Lane, Learning City, 12345"
              />
            </div>
          </div>
        </div>

        {/* System Details */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 px-6 py-4 flex items-center gap-3">
            <Globe className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Localization & System</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" /> Academic Year *
              </label>
              <select 
                required name="academicYear" value={settings.academicYear} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Wallet size={16} className="text-gray-400" /> Currency Symbol *
              </label>
              <select 
                required name="currencySymbol" value={settings.currencySymbol} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="₹">₹ (INR)</option>
                <option value="¥">¥ (JPY)</option>
                <option value="A$">A$ (AUD)</option>
                <option value="C$">C$ (CAD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Globe size={16} className="text-gray-400" /> Timezone *
              </label>
              <select 
                required name="timezone" value={settings.timezone} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-zinc-800">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
