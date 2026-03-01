"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import CommandPalette from "./components/CommandPalette";

interface AdminShellProps {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "◻" },
  { href: "/admin/projects", label: "Projects", icon: "◈" },
  { href: "/admin/skills", label: "Skills", icon: "◆" },
  { href: "/admin/experience", label: "Experience", icon: "◇" },
  { href: "/admin/articles", label: "Articles", icon: "▤" },
  { href: "/admin/media", label: "Media", icon: "▣" },
  { href: "/admin/profile", label: "Profile", icon: "◉" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

export default function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--bg-alt)",
          borderRight: "1px solid var(--border-color)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-6 h-16 shrink-0"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            H
          </div>
          <span className="font-semibold text-sm">Admin Panel</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive(item.href)
                  ? "rgba(var(--accent-rgb), 0.1)"
                  : "transparent",
                color: isActive(item.href) ? "var(--accent)" : "var(--text-light)",
              }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div
          className="px-4 py-4 shrink-0"
          style={{ borderTop: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: "rgba(var(--accent-rgb), 0.1)",
                color: "var(--accent)",
              }}
            >
              {user.name.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-light)" }}>
                {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ color: "var(--text-light)" }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center gap-4 px-6 h-16 shrink-0"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <button
            className="lg:hidden p-2 rounded-lg"
            onClick={() => setSidebarOpen(true)}
            style={{ color: "var(--text-light)" }}
          >
            <span className="text-xl">☰</span>
          </button>

          {/* Breadcrumb */}
          <Breadcrumb pathname={pathname} />

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{
                border: "1px solid var(--border-color)",
                color: "var(--text-light)",
              }}
              target="_blank"
            >
              View Site
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      <CommandPalette />
    </div>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        const label = seg.charAt(0).toUpperCase() + seg.slice(1);

        return (
          <span key={href} className="flex items-center gap-1.5">
            {i > 0 && (
              <span style={{ color: "var(--text-light)" }}>/</span>
            )}
            {isLast ? (
              <span className="font-medium">{label}</span>
            ) : (
              <Link
                href={href}
                className="transition-colors hover:text-[var(--accent)]"
                style={{ color: "var(--text-light)" }}
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
