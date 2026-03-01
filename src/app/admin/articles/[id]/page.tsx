"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface ArticleForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  status: string;
  isFeatured: number;
  categoryId: string;
  metaTitle: string;
  metaDescription: string;
  readingTime: number;
  publishedAt: string;
}

const defaultForm: ArticleForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  status: "draft",
  isFeatured: 0,
  categoryId: "",
  metaTitle: "",
  metaDescription: "",
  readingTime: 0,
  publishedAt: "",
};

export default function ArticleEditor() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";
  const [form, setForm] = useState<ArticleForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/articles/${params.id}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            const a = res.data;
            setForm({
              title: a.title || "",
              slug: a.slug || "",
              excerpt: a.excerpt || "",
              content: a.content || "",
              featuredImage: a.featuredImage || "",
              status: a.status || "draft",
              isFeatured: a.isFeatured || 0,
              categoryId: a.categoryId ? String(a.categoryId) : "",
              metaTitle: a.metaTitle || "",
              metaDescription: a.metaDescription || "",
              readingTime: a.readingTime || 0,
              publishedAt: a.publishedAt
                ? new Date(a.publishedAt).toISOString().slice(0, 16)
                : "",
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
      slug: prev.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = isNew ? "/api/admin/articles" : `/api/admin/articles/${params.id}`;
    const method = isNew ? "POST" : "PUT";

    const payload: Record<string, unknown> = { ...form };
    if (form.categoryId) payload.categoryId = Number(form.categoryId);
    else delete payload.categoryId;
    if (form.publishedAt) payload.publishedAt = new Date(form.publishedAt).toISOString();
    else delete payload.publishedAt;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/articles");
    } else {
      alert("Failed to save article");
    }
    setSaving(false);
  }

  if (loading) return <div className="animate-pulse h-96 rounded-xl" style={{ backgroundColor: "var(--bg-alt)" }} />;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? "New Article" : "Edit Article"}
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
            <button type="button" onClick={autoSlug} className="admin-btn-secondary">Auto</button>
          </div>
        </FormField>

        <FormField label="Excerpt">
          <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={3} className="admin-input" />
        </FormField>

        <FormField label="Content (HTML)">
          <textarea name="content" value={form.content} onChange={handleChange} rows={16} className="admin-input font-mono text-xs" />
        </FormField>

        <FormField label="Featured Image URL">
          <input name="featuredImage" value={form.featuredImage} onChange={handleChange} className="admin-input" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Status">
            <select name="status" value={form.status} onChange={handleChange} className="admin-input">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </FormField>
          <FormField label="Published At">
            <input name="publishedAt" type="datetime-local" value={form.publishedAt} onChange={handleChange} className="admin-input" />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Reading Time (min)">
            <input name="readingTime" type="number" value={form.readingTime} onChange={handleChange} className="admin-input" />
          </FormField>
          <FormField label="Category ID">
            <input name="categoryId" type="number" value={form.categoryId} onChange={handleChange} className="admin-input" />
          </FormField>
        </div>

        <FormField label="Meta Title">
          <input name="metaTitle" value={form.metaTitle} onChange={handleChange} className="admin-input" />
        </FormField>

        <FormField label="Meta Description">
          <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={2} className="admin-input" />
        </FormField>

        <FormField label="">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured === 1}
              onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked ? 1 : 0 }))}
            />
            Featured article
          </label>
        </FormField>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {saving ? "Saving..." : isNew ? "Create Article" : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.push("/admin/articles")} className="admin-btn-secondary">
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
