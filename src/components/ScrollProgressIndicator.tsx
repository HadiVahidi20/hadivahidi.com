"use client";

import { useScrollProgress } from "@/hooks/useScrollProgress";

interface ScrollProgressIndicatorProps {
  /** Height of the indicator bar in px (default: 3) */
  height?: number;
  /** Tailwind / CSS colour value (default: uses --accent CSS variable) */
  color?: string;
  /** z-index (default: 50) */
  zIndex?: number;
}

/**
 * A thin progress bar fixed to the top of the viewport that advances as
 * the user scrolls down the page.
 *
 * - Only visible when the user has started scrolling
 * - Respects prefers-reduced-motion: globals.css applies
 *   `transition-duration: 0.01ms !important` which overrides the inline
 *   transition, making the bar jump instantly for reduced-motion users
 * - Fully accessible: role="progressbar" with aria labels
 */
export default function ScrollProgressIndicator({
  height = 3,
  color = "var(--accent)",
  zIndex = 50,
}: ScrollProgressIndicatorProps) {
  const { progress } = useScrollProgress();
  const percent = Math.round(progress * 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label="Page scroll progress"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: `${height}px`,
        zIndex,
        pointerEvents: "none",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${percent}%`,
          backgroundColor: color,
          transformOrigin: "left",
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
}
