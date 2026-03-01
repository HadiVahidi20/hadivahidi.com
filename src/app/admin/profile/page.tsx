"use client";

import { useEffect, useState } from "react";

interface ProfileForm {
  firstName: string;
  lastName: string;
  professionalTitle: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  bio: string;
  about: string;
  profileImage: string;
  metaTitle: string;
  metaDescription: string;
  isAvailable: number;
}

const defaultForm: ProfileForm = {
  firstName: "",
  lastName: "",
  professionalTitle: "",
  location: "",
  email: "",
  phone: "",
  website: "",
  bio: "",
  about: "",
  profileImage: "",
  metaTitle: "",
  metaDescription: "",
  isAvailable: 1,
};

export default function AdminProfile() {
  const [form, setForm] = useState<ProfileForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const p = res.data;
          setForm({
            firstName: p.firstName || "",
            lastName: p.lastName || "",
            professionalTitle: p.professionalTitle || "",
            location: p.location || "",
            email: p.email || "",
            phone: p.phone || "",
            website: p.website || "",
            bio: p.bio || "",
            about: p.about || "",
            profileImage: p.profileImage || "",
            metaTitle: p.metaTitle || "",
            metaDescription: p.metaDescription || "",
            isAvailable: p.isAvailable ?? 1,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) setSaved(true);
    else alert("Failed to save profile");
    setSaving(false);
  }

  if (loading) return <div className="animate-pulse h-96 rounded-xl" style={{ backgroundColor: "var(--bg-alt)" }} />;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="First Name">
            <input name="firstName" value={form.firstName} onChange={handleChange} className="admin-input" />
          </FormField>
          <FormField label="Last Name">
            <input name="lastName" value={form.lastName} onChange={handleChange} className="admin-input" />
          </FormField>
        </div>

        <FormField label="Professional Title">
          <input name="professionalTitle" value={form.professionalTitle} onChange={handleChange} className="admin-input" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Email">
            <input name="email" type="email" value={form.email} onChange={handleChange} className="admin-input" />
          </FormField>
          <FormField label="Phone">
            <input name="phone" value={form.phone} onChange={handleChange} className="admin-input" />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Location">
            <input name="location" value={form.location} onChange={handleChange} className="admin-input" />
          </FormField>
          <FormField label="Website">
            <input name="website" value={form.website} onChange={handleChange} className="admin-input" />
          </FormField>
        </div>

        <FormField label="Bio (short)">
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} className="admin-input" />
        </FormField>

        <FormField label="About (detailed)">
          <textarea name="about" value={form.about} onChange={handleChange} rows={6} className="admin-input" />
        </FormField>

        <FormField label="Profile Image URL">
          <input name="profileImage" value={form.profileImage} onChange={handleChange} className="admin-input" />
        </FormField>

        <FormField label="">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isAvailable === 1}
              onChange={(e) => setForm((prev) => ({ ...prev, isAvailable: e.target.checked ? 1 : 0 }))}
            />
            Available for work
          </label>
        </FormField>

        <div
          className="rounded-xl p-5 mt-6"
          style={{ backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-color)" }}
        >
          <h2 className="font-semibold mb-4">SEO</h2>
          <div className="space-y-4">
            <FormField label="Meta Title">
              <input name="metaTitle" value={form.metaTitle} onChange={handleChange} className="admin-input" />
            </FormField>
            <FormField label="Meta Description">
              <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={2} className="admin-input" />
            </FormField>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
          {saved && (
            <span className="text-sm font-medium" style={{ color: "#10b981" }}>
              Saved successfully!
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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-light)" }}>{label}</label>}
      {children}
    </div>
  );
}
