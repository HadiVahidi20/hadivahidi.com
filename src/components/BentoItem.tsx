"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";

interface BentoItemProps {
  children: React.ReactNode;
  /** How many grid columns this item should span (default: 1) */
  colSpan?: number;
  /** How many grid rows this item should span (default: 1) */
  rowSpan?: number;
  /** Show a gradient border around the item */
  gradientBorder?: boolean;
  className?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const itemVariantsReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

/**
 * BentoItem — animated grid cell wrapper for use inside BentoGrid.
 *
 * Features:
 * - Picks up stagger timing from the parent BentoGrid container variant
 * - Hover scale (GPU-accelerated via `scale` transform)
 * - Optional gradient border
 * - Content overflow handling
 */
export function BentoItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  gradientBorder = false,
  className = "",
}: BentoItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? itemVariantsReduced : itemVariants;

  return (
    <motion.div
      variants={variants}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
      style={{
        gridColumn: colSpan > 1 ? `span ${colSpan} / span ${colSpan}` : undefined,
        gridRow: rowSpan > 1 ? `span ${rowSpan} / span ${rowSpan}` : undefined,
        overflow: "hidden",
        ...(gradientBorder
          ? {
              padding: "1px",
              background:
                "linear-gradient(135deg, rgba(var(--accent-rgb), 0.8), rgba(var(--accent-rgb), 0.2))",
              borderRadius: "1rem",
            }
          : {}),
      }}
    >
      {gradientBorder ? (
        <div
          style={{
            height: "100%",
            borderRadius: "calc(1rem - 1px)",
            background: "var(--bg)",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
}
