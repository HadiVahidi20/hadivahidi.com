"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminTable from "../components/AdminTable";

interface ExperienceItem {
  id: number;
  title: string;
  company: string;
  position: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: number;
  isActive: number;
  sortOrder: number | null;
}

export default function AdminExperience() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/experience")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setItems(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/experience/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
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
          <h1 className="text-2xl font-bold">Experience</h1>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>
            Manage your work experience
          </p>
        </div>
        <Link
          href="/admin/experience/new"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)" }}
        >
          + New Experience
        </Link>
      </div>

      <AdminTable
        data={items}
        columns={[
          { key: "title", label: "Title" },
          { key: "company", label: "Company" },
          { key: "position", label: "Position", render: (i) => i.position || "—" },
          {
            key: "startDate",
            label: "Period",
            render: (i) => `${i.startDate?.slice(0, 7) || ""} — ${i.isCurrent ? "Present" : i.endDate?.slice(0, 7) || ""}`,
          },
          {
            key: "isActive",
            label: "Status",
            render: (i) => (
              <span
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: i.isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  color: i.isActive ? "#10b981" : "#ef4444",
                }}
              >
                {i.isActive ? "Active" : "Inactive"}
              </span>
            ),
          },
        ]}
        onEdit={(i) => (window.location.href = `/admin/experience/${i.id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
}
