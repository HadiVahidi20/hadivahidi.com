"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  /** Extra blur radius in px on top of the default 12px (default: 0) */
  blurExtra?: number;
  /** Disable the hover glow border effect */
  noGlow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * GlassCard — Glassmorphism card with:
 * - `backdrop-filter: blur()` frosted-glass effect
 * - Adaptive opacity for light / dark themes via CSS variables
 * - Border glow on hover (GPU-accelerated box-shadow transition)
 * - Entrance animation via Framer Motion `whileInView`
 * - Respects `prefers-reduced-motion`
 */
export function GlassCard({
  children,
  blurExtra = 0,
  noGlow = false,
  className = "",
  style,
}: GlassCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const blurPx = 12 + blurExtra;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={
        shouldReduceMotion
          ? { duration: 0.01 }
          : { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
      }
      whileHover={
        noGlow || shouldReduceMotion
          ? undefined
          : {
              boxShadow: `0 0 0 1.5px rgba(var(--accent-rgb), 0.6),
                          0 8px 32px rgba(var(--accent-rgb), 0.2)`,
            }
      }
      className={`glass-card ${className}`}
      style={{
        /* Frosted glass base */
        backdropFilter: `blur(${blurPx}px)`,
        WebkitBackdropFilter: `blur(${blurPx}px)`,
        /* Adaptive background: more opaque in dark, near-transparent in light */
        background: `rgba(var(--bg-rgb), var(--glass-opacity, 0.55))`,
        border: "1px solid rgba(var(--text-rgb), 0.08)",
        borderRadius: "1rem",
        /* GPU-accelerated properties only */
        willChange: "transform, opacity, box-shadow",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
