"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminTable from "../components/AdminTable";

interface Project {
  id: number;
  title: string;
  slug: string;
  status: string | null;
  isActive: number;
  isFeatured: number;
  sortOrder: number | null;
  technologies: string | null;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setProjects(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>
            Manage your portfolio projects
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)" }}
        >
          + New Project
        </Link>
      </div>

      <AdminTable
        data={projects}
        columns={[
          { key: "title", label: "Title" },
          { key: "slug", label: "Slug" },
          {
            key: "status",
            label: "Status",
            render: (p) => (
              <span
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: p.isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  color: p.isActive ? "#10b981" : "#ef4444",
                }}
              >
                {p.isActive ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "isFeatured",
            label: "Featured",
            render: (p) => (p.isFeatured ? "Yes" : "No"),
          },
          {
            key: "sortOrder",
            label: "Order",
            render: (p) => String(p.sortOrder ?? 0),
          },
        ]}
        onEdit={(p) => (window.location.href = `/admin/projects/${p.id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-16 rounded-xl animate-pulse"
          style={{ backgroundColor: "var(--bg-alt)" }}
        />
      ))}
    </div>
  );
}
