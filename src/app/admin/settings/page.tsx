"use client";

import { useEffect, useState } from "react";

const settingKeys = [
  { key: "site_title", label: "Site Title", type: "text" },
  { key: "site_description", label: "Site Description", type: "textarea" },
  { key: "articles_enabled", label: "Articles Enabled", type: "toggle" },
  { key: "contact_email", label: "Contact Email", type: "text" },
  { key: "google_analytics_id", label: "Google Analytics ID", type: "text" },
  { key: "maintenance_mode", label: "Maintenance Mode", type: "toggle" },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setSettings(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const items = Object.entries(settings).map(([key, value]) => ({ key, value }));
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: items }),
    });

    if (res.ok) setSaved(true);
    else alert("Failed to save settings");
    setSaving(false);
  }

  if (loading) return <div className="animate-pulse h-96 rounded-xl" style={{ backgroundColor: "var(--bg-alt)" }} />;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className="rounded-xl p-6 space-y-5"
          style={{ backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-color)" }}
        >
          {settingKeys.map((setting) => (
            <div key={setting.key}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-light)" }}>
                {setting.label}
              </label>
              {setting.type === "toggle" ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings[setting.key] === "1" || settings[setting.key] === "true"}
                    onChange={(e) => handleChange(setting.key, e.target.checked ? "1" : "0")}
                  />
                  <span className="text-sm">
                    {settings[setting.key] === "1" || settings[setting.key] === "true" ? "Enabled" : "Disabled"}
                  </span>
                </label>
              ) : setting.type === "textarea" ? (
                <textarea
                  value={settings[setting.key] || ""}
                  onChange={(e) => handleChange(setting.key, e.target.value)}
                  rows={3}
                  className="admin-input"
                />
              ) : (
                <input
                  value={settings[setting.key] || ""}
                  onChange={(e) => handleChange(setting.key, e.target.value)}
                  className="admin-input"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && (
            <span className="text-sm font-medium" style={{ color: "#10b981" }}>
              Saved!
            </span>
          )}
        </div>
      </form>

      <style jsx global>{`
        .admin-input { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; background-color: var(--bg); border: 1px solid var(--border-color); color: var(--text); }
        .admin-input:focus { outline: 2px solid var(--accent); outline-offset: -1px; }
      `}</style>
    </div>
  );
}
