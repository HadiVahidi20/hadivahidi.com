"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxSection({
  children,
  speed = 0.3,
  className,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // speed > 0: element moves up slower than scroll (parallax behind)
  // speed < 0: element moves in opposite direction
  const clampedSpeed = Math.max(-1, Math.min(1, speed));
  const yStart = prefersReducedMotion ? "0%" : `${clampedSpeed * -50}%`;
  const yEnd = prefersReducedMotion ? "0%" : `${clampedSpeed * 50}%`;
  const y = useTransform(scrollYProgress, [0, 1], [yStart, yEnd]);

  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
