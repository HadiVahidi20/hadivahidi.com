"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminTable from "../components/AdminTable";

interface Article {
  id: number;
  title: string;
  slug: string;
  status: string | null;
  isFeatured: number;
  publishedAt: string | null;
  viewCount: number | null;
  category: { name: string } | null;
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/articles")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setArticles(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    if (res.ok) setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-alt)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Articles</h1>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>
            Manage your blog articles
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)" }}
        >
          + New Article
        </Link>
      </div>

      <AdminTable
        data={articles}
        columns={[
          { key: "title", label: "Title" },
          {
            key: "category",
            label: "Category",
            render: (a) => a.category?.name || "—",
          },
          {
            key: "status",
            label: "Status",
            render: (a) => (
              <span
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  backgroundColor:
                    a.status === "published"
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(245, 158, 11, 0.1)",
                  color: a.status === "published" ? "#10b981" : "#f59e0b",
                }}
              >
                {a.status || "draft"}
              </span>
            ),
          },
          {
            key: "publishedAt",
            label: "Published",
            render: (a) =>
              a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : "—",
          },
          {
            key: "viewCount",
            label: "Views",
            render: (a) => String(a.viewCount || 0),
          },
        ]}
        onEdit={(a) => (window.location.href = `/admin/articles/${a.id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
}
