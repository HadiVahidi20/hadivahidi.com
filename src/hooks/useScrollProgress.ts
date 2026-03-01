"use client";

import { useState, useEffect, useRef } from "react";

interface ScrollProgressOptions {
  /** Element to track scroll progress within (defaults to document) */
  target?: React.RefObject<HTMLElement | null>;
  /** Throttle interval in ms (defaults to 16 for ~60fps) */
  throttleMs?: number;
}

interface ScrollProgressResult {
  /** 0–1 representing how far the user has scrolled */
  progress: number;
  /** Current scroll position in pixels */
  scrollY: number;
  /** Total scrollable height in pixels */
  scrollHeight: number;
  /** Whether the user has scrolled past the initial viewport */
  isScrolled: boolean;
  /** Scroll direction: "up" | "down" | null (null on first render) */
  direction: "up" | "down" | null;
}

/**
 * Hook for tracking scroll progress, usable for scroll-driven animations.
 *
 * Returns a normalised 0–1 progress value plus helpers for direction and
 * whether the page has been scrolled at all.
 */
export function useScrollProgress(
  options: ScrollProgressOptions = {},
): ScrollProgressResult {
  const { throttleMs = 16, target } = options;

  const [state, setState] = useState<ScrollProgressResult>({
    progress: 0,
    scrollY: 0,
    scrollHeight: 0,
    isScrolled: false,
    direction: null,
  });

  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastUpdateTime = useRef(0);

  useEffect(() => {
    lastUpdateTime.current = 0; // reset on throttleMs / target change
    const el = target?.current ?? null;
    const scrollTarget = el ?? window;

    const readScroll = () => {
      let scrollY: number;
      let scrollHeight: number;
      let clientHeight: number;

      if (el) {
        scrollY = el.scrollTop;
        scrollHeight = el.scrollHeight;
        clientHeight = el.clientHeight;
      } else {
        scrollY = window.scrollY;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      }
      return { scrollY, scrollHeight, clientHeight };
    };

    const handleUpdate = () => {
      const now = performance.now();
      if (now - lastUpdateTime.current < throttleMs) return;
      lastUpdateTime.current = now;

      const { scrollY, scrollHeight, clientHeight } = readScroll();
      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
      const direction =
        scrollY > lastScrollY.current
          ? "down"
          : scrollY < lastScrollY.current
            ? "up"
            : null;

      lastScrollY.current = scrollY;

      setState({
        progress,
        scrollY,
        scrollHeight,
        isScrolled: scrollY > 0,
        direction,
      });
    };

    const onScroll = () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(handleUpdate);
    };

    scrollTarget.addEventListener("scroll", onScroll, { passive: true });

    // Read initial position on next paint to avoid setState-in-effect warning
    rafId.current = requestAnimationFrame(handleUpdate);

    return () => {
      scrollTarget.removeEventListener("scroll", onScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [target, throttleMs]);

  return state;
}
