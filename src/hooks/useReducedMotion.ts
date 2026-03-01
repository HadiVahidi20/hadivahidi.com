"use client";

import { useEffect, useState } from "react";

/**
 * useReducedMotion – returns `true` when the user has requested reduced motion
 * via the `prefers-reduced-motion: reduce` media query.
 *
 * Use this hook to conditionally disable or simplify animations in React
 * components (the global CSS rule in `globals.css` already handles CSS
 * transitions/animations, but JS-driven animations need this hook).
 *
 * @example
 * function AnimatedCard() {
 *   const reduced = useReducedMotion();
 *   return (
 *     <motion.div
 *       animate={{ opacity: 1 }}
 *       transition={{ duration: reduced ? 0 : 0.3 }}
 *     />
 *   );
 * }
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    // Safe SSR default – assume no preference on the server.
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReduced;
}
