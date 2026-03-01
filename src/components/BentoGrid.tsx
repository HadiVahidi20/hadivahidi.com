"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";

interface BentoGridProps {
  children: React.ReactNode;
  /** Number of columns on desktop (default: 4) */
  cols?: number;
  /** Gap between grid cells in rem (default: 1) */
  gap?: number;
  /** Padding around the grid in rem (default: 0) */
  padding?: number;
  className?: string;
}

/**
 * BentoGrid — CSS Grid container that stagger-animates its children
 * on scroll using Framer Motion `whileInView`.
 *
 * Breakpoints (via .bento-grid CSS class in globals.css):
 *   Desktop  → `cols` columns (default 4)
 *   Tablet   → 2 columns
 *   Mobile   → 1 column
 */
export function BentoGrid({
  children,
  cols = 4,
  gap = 1,
  padding = 0,
  className = "",
}: BentoGridProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
      className={`bento-grid ${className}`}
      style={
        {
          "--bento-cols": cols,
          "--bento-gap": `${gap}rem`,
          "--bento-padding": `${padding}rem`,
        } as React.CSSProperties
      }
    >
      {children}
    </motion.div>
  );
}
