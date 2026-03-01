"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface ProjectForm {
  title: string;
  slug: string;
  subtitle: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  technologies: string;
  status: string;
  isFeatured: number;
  isActive: number;
  sortOrder: number;
}

const defaultForm: ProjectForm = {
  title: "",
  slug: "",
  subtitle: "",
  shortDescription: "",
  description: "",
  thumbnail: "",
  technologies: "",
  status: "active",
  isFeatured: 0,
  isActive: 1,
  sortOrder: 0,
};

export default function ProjectEditor() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";
  const [form, setForm] = useState<ProjectForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/projects/${params.id}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            const p = res.data;
            setForm({
              title: p.title || "",
              slug: p.slug || "",
              subtitle: p.subtitle || "",
              shortDescription: p.shortDescription || "",
              description: p.description || "",
              thumbnail: p.thumbnail || "",
              technologies: p.technologies || "",
              status: p.status || "active",
              isFeatured: p.isFeatured || 0,
              isActive: p.isActive ?? 1,
              sortOrder: p.sortOrder || 0,
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isNew, params.id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function autoSlug() {
    setForm((prev) => ({
      ...prev,
      slug: prev.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = isNew ? "/api/admin/projects" : `/api/admin/projects/${params.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/admin/projects");
    } else {
      alert("Failed to save project");
    }
    setSaving(false);
  }

  if (loading) return <div className="animate-pulse h-96 rounded-xl" style={{ backgroundColor: "var(--bg-alt)" }} />;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? "New Project" : "Edit Project"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Title">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            onBlur={() => isNew && !form.slug && autoSlug()}
            required
            className="admin-input"
          />
        </FormField>

        <FormField label="Slug">
          <div className="flex gap-2">
            <input name="slug" value={form.slug} onChange={handleChange} required className="admin-input flex-1" />
            <button type="button" onClick={autoSlug} className="admin-btn-secondary">
              Auto
            </button>
          </div>
        </FormField>

        <FormField label="Subtitle">
          <input name="subtitle" value={form.subtitle} onChange={handleChange} className="admin-input" />
        </FormField>

        <FormField label="Short Description">
          <textarea name="shortDescription" value={form.shortDescription} onChange={handleChange} rows={2} className="admin-input" />
        </FormField>

        <FormField label="Description (HTML)">
          <textarea name="description" value={form.description} onChange={handleChange} rows={8} className="admin-input font-mono text-xs" />
        </FormField>

        <FormField label="Thumbnail URL">
          <input name="thumbnail" value={form.thumbnail} onChange={handleChange} className="admin-input" />
        </FormField>

        <FormField label="Technologies (comma-separated)">
          <input name="technologies" value={form.technologies} onChange={handleChange} className="admin-input" />
        </FormField>

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

        <FormField label="">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured === 1}
              onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked ? 1 : 0 }))}
            />
            Featured project
          </label>
        </FormField>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {saving ? "Saving..." : isNew ? "Create Project" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
            className="admin-btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>

      <style jsx global>{`
        .admin-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background-color: var(--bg);
          border: 1px solid var(--border-color);
          color: var(--text);
        }
        .admin-input:focus {
          outline: 2px solid var(--accent);
          outline-offset: -1px;
        }
        .admin-btn-secondary {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          border: 1px solid var(--border-color);
          color: var(--text-light);
          transition: all 0.2s;
        }
      `}</style>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-light)" }}>
          {label}
        </label>
      )}
      {children}
    </div>
  );
}
