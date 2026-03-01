"use client";

import { motion, useReducedMotion } from "framer-motion";

interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
  gradientBorder?: boolean;
}

export function BentoItem({
  children,
  className = "",
  colSpan = 1,
  rowSpan = 1,
  gradientBorder = false,
}: BentoItemProps) {
  const shouldReduceMotion = useReducedMotion();

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${gradientBorder ? "p-px" : ""} ${className}`}
      style={{
        gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined,
        gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
        background: gradientBorder
          ? "linear-gradient(135deg, rgba(var(--accent-rgb), 0.6), rgba(var(--accent-rgb), 0.1), rgba(var(--accent-rgb), 0.4))"
          : undefined,
      }}
      variants={itemVariants}
      whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {gradientBorder ? (
        <div
          className="relative h-full w-full rounded-2xl"
          style={{ background: "var(--bg)" }}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
}
