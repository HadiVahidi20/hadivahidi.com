"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  label: string;
  href?: string;
  action?: () => void;
  section: string;
}

const commands: CommandItem[] = [
  { label: "Dashboard", href: "/admin", section: "Navigation" },
  { label: "Projects", href: "/admin/projects", section: "Navigation" },
  { label: "Articles", href: "/admin/articles", section: "Navigation" },
  { label: "Skills", href: "/admin/skills", section: "Navigation" },
  { label: "Experience", href: "/admin/experience", section: "Navigation" },
  { label: "Media Library", href: "/admin/media", section: "Navigation" },
  { label: "Profile", href: "/admin/profile", section: "Navigation" },
  { label: "Settings", href: "/admin/settings", section: "Navigation" },
  { label: "New Project", href: "/admin/projects/new", section: "Actions" },
  { label: "New Article", href: "/admin/articles/new", section: "Actions" },
  { label: "New Experience", href: "/admin/experience/new", section: "Actions" },
  { label: "View Site", href: "/", section: "Actions" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelected(0);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()),
  );

  const sections = [...new Set(filtered.map((c) => c.section))];

  function execute(cmd: CommandItem) {
    setOpen(false);
    if (cmd.href) router.push(cmd.href);
    if (cmd.action) cmd.action();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[selected]) {
      execute(filtered[selected]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div
        className="relative w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-color)" }}
      >
        <div style={{ borderBottom: "1px solid var(--border-color)" }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="w-full px-5 py-4 text-sm bg-transparent outline-none"
            style={{ color: "var(--text)" }}
          />
        </div>

        <div className="max-h-72 overflow-y-auto py-2">
          {sections.map((section) => (
            <div key={section}>
              <p className="px-5 py-1.5 text-xs font-medium" style={{ color: "var(--text-light)" }}>
                {section}
              </p>
              {filtered
                .filter((c) => c.section === section)
                .map((cmd) => {
                  const idx = filtered.indexOf(cmd);
                  return (
                    <button
                      key={cmd.label}
                      className="w-full text-left px-5 py-2.5 text-sm transition-colors"
                      style={{
                        backgroundColor: idx === selected ? "rgba(var(--accent-rgb), 0.1)" : "transparent",
                        color: idx === selected ? "var(--accent)" : "var(--text)",
                      }}
                      onMouseEnter={() => setSelected(idx)}
                      onClick={() => execute(cmd)}
                    >
                      {cmd.label}
                    </button>
                  );
                })}
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="px-5 py-8 text-center text-sm" style={{ color: "var(--text-light)" }}>
              No results found.
            </p>
          )}
        </div>

        <div
          className="flex items-center justify-between px-5 py-2.5 text-xs"
          style={{ borderTop: "1px solid var(--border-color)", color: "var(--text-light)" }}
        >
          <span>Navigate with arrow keys</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
