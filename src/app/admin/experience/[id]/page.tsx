"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface ExperienceForm {
  title: string;
  company: string;
  location: string;
  position: string;
  employmentType: string;
  description: string;
  startDate: string;
  endDate: string;
  isCurrent: number;
  companyLogo: string;
  companyWebsite: string;
  isActive: number;
  sortOrder: number;
}

const defaultForm: ExperienceForm = {
  title: "",
  company: "",
  location: "",
  position: "",
  employmentType: "full-time",
  description: "",
  startDate: "",
  endDate: "",
  isCurrent: 0,
  companyLogo: "",
  companyWebsite: "",
  isActive: 1,
  sortOrder: 0,
};

export default function ExperienceEditor() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";
  const [form, setForm] = useState<ExperienceForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/experience/${params.id}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            const e = res.data;
            setForm({
              title: e.title || "",
              company: e.company || "",
              location: e.location || "",
              position: e.position || "",
              employmentType: e.employmentType || "full-time",
              description: e.description || "",
              startDate: e.startDate ? String(e.startDate).slice(0, 10) : "",
              endDate: e.endDate ? String(e.endDate).slice(0, 10) : "",
              isCurrent: e.isCurrent || 0,
              companyLogo: e.companyLogo || "",
              companyWebsite: e.companyWebsite || "",
              isActive: e.isActive ?? 1,
              sortOrder: e.sortOrder || 0,
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isNew, params.id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = isNew ? "/api/admin/experience" : `/api/admin/experience/${params.id}`;
    const method = isNew ? "POST" : "PUT";
    const payload = {
      ...form,
      endDate: form.isCurrent ? null : form.endDate || null,
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) router.push("/admin/experience");
    else alert("Failed to save");
    setSaving(false);
  }

  if (loading) return <div className="animate-pulse h-96 rounded-xl" style={{ backgroundColor: "var(--bg-alt)" }} />;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? "New Experience" : "Edit Experience"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Job Title">
            <input name="title" value={form.title} onChange={handleChange} required className="admin-input" />
          </FormField>
          <FormField label="Company">
            <input name="company" value={form.company} onChange={handleChange} required className="admin-input" />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Position">
            <input name="position" value={form.position} onChange={handleChange} className="admin-input" />
          </FormField>
          <FormField label="Location">
            <input name="location" value={form.location} onChange={handleChange} className="admin-input" />
          </FormField>
        </div>

        <FormField label="Employment Type">
          <select name="employmentType" value={form.employmentType} onChange={handleChange} className="admin-input">
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
            <option value="internship">Internship</option>
          </select>
        </FormField>

        <FormField label="Description">
          <textarea name="description" value={form.description} onChange={handleChange} rows={6} className="admin-input" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date">
            <input name="startDate" type="date" value={form.startDate} onChange={handleChange} required className="admin-input" />
          </FormField>
          <FormField label="End Date">
            <input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              disabled={form.isCurrent === 1}
              className="admin-input"
            />
          </FormField>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isCurrent === 1}
            onChange={(e) => setForm((prev) => ({ ...prev, isCurrent: e.target.checked ? 1 : 0, endDate: "" }))}
          />
          Currently working here
        </label>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Company Logo URL">
            <input name="companyLogo" value={form.companyLogo} onChange={handleChange} className="admin-input" />
          </FormField>
          <FormField label="Company Website">
            <input name="companyWebsite" value={form.companyWebsite} onChange={handleChange} className="admin-input" />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Sort Order">
            <input name="sortOrder" type="number" value={form.sortOrder} onChange={handleChange} className="admin-input" />
          </FormField>
          <FormField label="Status">
            <select name="isActive" value={form.isActive} onChange={handleChange} className="admin-input">
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </FormField>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {saving ? "Saving..." : isNew ? "Create" : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.push("/admin/experience")} className="admin-btn-secondary">
            Cancel
          </button>
        </div>
      </form>

      <style jsx global>{`
        .admin-input { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; background-color: var(--bg); border: 1px solid var(--border-color); color: var(--text); }
        .admin-input:focus { outline: 2px solid var(--accent); outline-offset: -1px; }
        .admin-btn-secondary { padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; border: 1px solid var(--border-color); color: var(--text-light); }
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
