"use client";

import { useEffect, useRef } from "react";

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  activeSection: string;
  onNavClick: (href: string) => (e: React.MouseEvent) => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  navLinks,
  activeSection,
  onNavClick,
}: MobileMenuProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape key and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    // Focus the close button when menu opens
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const focusableSelectors =
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(
      menuRef.current.querySelectorAll<HTMLElement>(focusableSelectors),
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="mobile-menu"
      ref={menuRef}
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu panel */}
      <div
        className="absolute inset-0 flex flex-col"
        style={{ backgroundColor: "var(--bg)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 h-16 border-b"
          style={{ borderColor: "var(--border-color)" }}
        >
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white font-bold text-sm"
            style={{ backgroundColor: "var(--accent)" }}
            aria-hidden="true"
          >
            HV
          </span>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded-md transition-colors"
            style={{ color: "var(--text-light)" }}
            aria-label="Close navigation menu"
          >
            {/* X icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav
          className="flex-1 flex flex-col justify-center px-8"
          aria-label="Mobile navigation"
        >
          <ul className="space-y-1" role="list">
            {navLinks.map(({ href, label }, i) => (
              <li
                key={href}
                className="mobile-menu-item"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <a
                  href={href}
                  onClick={(e) => {
                    onNavClick(href)(e);
                    onClose();
                  }}
                  className="flex items-center text-4xl font-bold py-3 transition-colors"
                  style={{
                    color:
                      activeSection === href
                        ? "var(--accent)"
                        : "var(--text)",
                  }}
                  aria-current={activeSection === href ? "page" : undefined}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA at bottom */}
        <div
          className="px-8 pb-12 border-t pt-6"
          style={{ borderColor: "var(--border-color)" }}
        >
          <a
            href="#contact"
            onClick={(e) => {
              onNavClick("#contact")(e);
              onClose();
            }}
            className="flex items-center justify-center w-full px-6 py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Hire Me
          </a>
        </div>
      </div>
    </div>
  );
}
