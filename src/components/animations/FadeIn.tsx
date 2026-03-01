"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

type Direction = "up" | "down" | "left" | "right";

interface FadeInProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
}

const directionOffsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 30 },
  down: { x: 0, y: -30 },
  left: { x: 30, y: 0 },
  right: { x: -30, y: 0 },
};

function resolveOffset(
  direction: Direction,
  distance: number | undefined,
): { x: number; y: number } {
  const base = directionOffsets[direction];
  if (distance === undefined) return base;
  return {
    x: base.x !== 0 ? Math.sign(base.x) * distance : 0,
    y: base.y !== 0 ? Math.sign(base.y) * distance : 0,
  };
}

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  distance,
  className,
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-10% 0px" });
  const prefersReducedMotion = useReducedMotion();

  const offset = resolveOffset(direction, distance);

  const initial = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, ...offset };

  const animate = isInView
    ? { opacity: 1, x: 0, y: 0 }
    : initial;

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration: prefersReducedMotion ? 0.2 : duration,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
