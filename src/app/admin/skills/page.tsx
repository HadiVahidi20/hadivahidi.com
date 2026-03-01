"use client";

import { useEffect, useState } from "react";

interface Skill {
  id: number;
  name: string;
  proficiencyLevel: number | null;
  icon: string | null;
  color: string | null;
  isFeatured: number;
  isActive: number;
  sortOrder: number | null;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  skills: Skill[];
}

export default function AdminSkills() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [newSkill, setNewSkill] = useState({ name: "", categoryId: 0, proficiencyLevel: 50 });

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    fetch("/api/admin/skills")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCategories(res.data);
      })
      .finally(() => setLoading(false));
  }

  async function addSkill(categoryId: number) {
    if (!newSkill.name) return;
    const res = await fetch("/api/admin/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newSkill, categoryId }),
    });
    if (res.ok) {
      setNewSkill({ name: "", categoryId: 0, proficiencyLevel: 50 });
      loadData();
    }
  }

  async function deleteSkill(id: number) {
    if (!confirm("Delete this skill?")) return;
    await fetch(`/api/admin/skills/${id}`, { method: "DELETE" });
    loadData();
  }

  async function updateSkill(id: number, data: Partial<Skill>) {
    await fetch(`/api/admin/skills/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditingSkill(null);
    loadData();
  }

  async function addCategory() {
    const name = prompt("Category name:");
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await fetch("/api/admin/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "category", name, slug }),
    });
    loadData();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-alt)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skills</h1>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>
            Manage skill categories and individual skills
          </p>
        </div>
        <button
          onClick={addCategory}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)" }}
        >
          + New Category
        </button>
      </div>

      {categories.map((cat) => (
        <div
          key={cat.id}
          className="rounded-xl p-6"
          style={{ backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: cat.color || "var(--accent)" }}
            />
            <h2 className="font-semibold">{cat.name}</h2>
            <span className="text-xs" style={{ color: "var(--text-light)" }}>
              ({cat.skills.length} skills)
            </span>
          </div>

          <div className="space-y-2">
            {cat.skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-3 py-2 px-3 rounded-lg"
                style={{ backgroundColor: "var(--bg)" }}
              >
                {editingSkill?.id === skill.id ? (
                  <>
                    <input
                      value={editingSkill.name}
                      onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                      className="flex-1 px-2 py-1 rounded text-sm"
                      style={{ backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-color)", color: "var(--text)" }}
                    />
                    <input
                      type="number"
                      value={editingSkill.proficiencyLevel || 0}
                      onChange={(e) => setEditingSkill({ ...editingSkill, proficiencyLevel: Number(e.target.value) })}
                      className="w-20 px-2 py-1 rounded text-sm"
                      style={{ backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-color)", color: "var(--text)" }}
                      min={0}
                      max={100}
                    />
                    <button
                      onClick={() => updateSkill(skill.id, { name: editingSkill.name, proficiencyLevel: editingSkill.proficiencyLevel })}
                      className="text-xs px-2 py-1 rounded"
                      style={{ backgroundColor: "rgba(var(--accent-rgb), 0.1)", color: "var(--accent)" }}
                    >
                      Save
                    </button>
                    <button onClick={() => setEditingSkill(null)} className="text-xs px-2 py-1" style={{ color: "var(--text-light)" }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{skill.name}</span>
                    <span className="text-xs" style={{ color: "var(--text-light)" }}>
                      {skill.proficiencyLevel || 0}%
                    </span>
                    <button
                      onClick={() => setEditingSkill(skill)}
                      className="text-xs px-2 py-1 rounded"
                      style={{ color: "var(--accent)" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSkill(skill.id)}
                      className="text-xs px-2 py-1 rounded"
                      style={{ color: "#ef4444" }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add new skill to this category */}
          <div className="flex gap-2 mt-3">
            <input
              placeholder="New skill name"
              value={newSkill.categoryId === cat.id ? newSkill.name : ""}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value, categoryId: cat.id })}
              className="flex-1 px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border-color)", color: "var(--text)" }}
            />
            <input
              type="number"
              placeholder="%"
              value={newSkill.categoryId === cat.id ? newSkill.proficiencyLevel : 50}
              onChange={(e) => setNewSkill({ ...newSkill, proficiencyLevel: Number(e.target.value), categoryId: cat.id })}
              className="w-20 px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border-color)", color: "var(--text)" }}
              min={0}
              max={100}
            />
            <button
              onClick={() => addSkill(cat.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Add
            </button>
          </div>
        </div>
      ))}

      {categories.length === 0 && (
        <div className="text-center py-16 rounded-xl" style={{ backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-color)" }}>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>
            No skill categories yet. Create one to get started.
          </p>
        </div>
      )}
    </div>
  );
}
