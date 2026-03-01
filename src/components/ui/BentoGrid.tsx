"use client";

import { motion, useReducedMotion } from "framer-motion";

const gapMap = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
} as const;

const colsMap = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
}

export function BentoGrid({
  children,
  className = "",
  columns = 4,
  gap = "md",
}: BentoGridProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: shouldReduceMotion
        ? {}
        : { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };

  return (
    <motion.div
      className={`grid ${colsMap[columns]} ${gapMap[gap]} ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {children}
    </motion.div>
  );
}
