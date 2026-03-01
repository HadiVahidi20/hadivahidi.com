"use client";

import { useState } from "react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface AdminTableProps<T extends { id: number }> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (id: number) => void;
  onReorder?: (items: T[]) => void;
}

export default function AdminTable<T extends { id: number }>({
  data,
  columns,
  onEdit,
  onDelete,
}: AdminTableProps<T>) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    columns.some((col) => {
      const val = (item as Record<string, unknown>)[col.key];
      return String(val || "").toLowerCase().includes(search.toLowerCase());
    }),
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-4 py-2 rounded-lg text-sm mb-4"
        style={{
          backgroundColor: "var(--bg)",
          border: "1px solid var(--border-color)",
          color: "var(--text)",
        }}
      />

      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border-color)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--bg-alt)" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 font-medium"
                  style={{ color: "var(--text-light)", borderBottom: "1px solid var(--border-color)" }}
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th
                  className="text-right px-4 py-3 font-medium"
                  style={{ color: "var(--text-light)", borderBottom: "1px solid var(--border-color)" }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.id}
                className="transition-colors"
                style={{ borderBottom: "1px solid var(--border-color)" }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 text-right space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                        style={{
                          backgroundColor: "rgba(var(--accent-rgb), 0.1)",
                          color: "var(--accent)",
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure?")) onDelete(item.id);
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                        style={{
                          backgroundColor: "rgba(239, 68, 68, 0.1)",
                          color: "#ef4444",
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "var(--text-light)" }}>
              {search ? "No results found." : "No items yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
