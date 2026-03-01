"use client";

import { useEffect, useRef, type RefObject } from "react";

/** CSS selector that matches all natively focusable elements. */
const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  "details > summary",
].join(", ");

/**
 * useFocusTrap – constrains keyboard focus to a container element while
 * `active` is `true`. Useful for modals, drawers, and menus that should
 * prevent focus from escaping to background content.
 *
 * Focus is moved to the first focusable child when the trap becomes active.
 * Tab / Shift+Tab wrap around within the container.
 *
 * @param active - Whether the trap is currently enabled.
 * @returns A ref to attach to the container element.
 *
 * @example
 * function Modal({ open }: { open: boolean }) {
 *   const ref = useFocusTrap<HTMLDivElement>(open);
 *   return <div ref={ref} role="dialog" aria-modal="true">…</div>;
 * }
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
): RefObject<T | null> {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const getFocusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
      ).filter((el) => !el.closest("[inert]"));

    // Move focus into the trap on activation.
    getFocusable()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [active]);

  return containerRef;
}
