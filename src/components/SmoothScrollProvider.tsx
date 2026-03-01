"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the application with Lenis smooth scrolling.
 *
 * Behaviour:
 * - Desktop: Lenis provides physics-based smooth scrolling
 * - Touch devices: Falls back to native scrolling for performance
 * - Reduced motion: Lenis is disabled; native scroll-behavior:auto applies
 * - Keyboard nav (Tab, Space, PageUp/Down, ArrowKeys) continues to work
 * - In-page anchor links work via the `scrollToSection` utility
 * - Browser back/forward navigation preserves scroll position (Next.js default)
 */
export default function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Don't enable Lenis on touch-only devices or when the user prefers
    // reduced motion – native scrolling is faster and more accessible.
    const isTouchDevice =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isTouchDevice || prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 0, // disable touch on Lenis; native handles it
      infinite: false,
      autoRaf: true,
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
