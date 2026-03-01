"use client";

import { motion, useReducedMotion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  blurAmount?: "sm" | "md" | "lg";
  hoverGlow?: boolean;
}

const blurMap = {
  sm: "blur(8px)",
  md: "blur(16px)",
  lg: "blur(24px)",
} as const;

export function GlassCard({
  children,
  className = "",
  blurAmount = "md",
  hoverGlow = true,
}: GlassCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const glassStyle: React.CSSProperties = {
    backdropFilter: blurMap[blurAmount],
    WebkitBackdropFilter: blurMap[blurAmount],
    background: "rgba(var(--bg-rgb), 0.6)",
    border: "1px solid rgba(var(--accent-rgb), 0.15)",
    borderRadius: "1rem",
    transform: "translateZ(0)",
  };

  const hoverVariant =
    hoverGlow && !shouldReduceMotion
      ? {
          boxShadow: `0 0 20px 2px rgba(var(--accent-rgb), 0.25), 0 0 40px 4px rgba(var(--accent-rgb), 0.1)`,
          borderColor: `rgba(var(--accent-rgb), 0.4)`,
        }
      : {};

  return (
    <motion.div
      className={`overflow-hidden p-6 ${className}`}
      style={glassStyle}
      whileHover={hoverVariant}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
