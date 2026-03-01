"use client";

import { createContext, useContext, useRef } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";

type AnimationType = "fade" | "slide" | "scale";
type Direction = "up" | "down" | "left" | "right";

interface StaggerChildrenProps {
  children: React.ReactNode;
  staggerDelay?: number;
  animationType?: AnimationType;
  direction?: Direction;
  duration?: number;
  delay?: number;
  className?: string;
  once?: boolean;
  triggerOnMount?: boolean;
}

const StaggerItemVariantsContext = createContext<Variants>({});

const getChildVariants = (
  animationType: AnimationType,
  direction: Direction,
  duration: number,
  prefersReducedMotion: boolean,
): Variants => {
  if (prefersReducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } },
    };
  }

  const distance = 30;
  const slideOffset: Record<Direction, { x?: number; y?: number }> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  switch (animationType) {
    case "slide":
      return {
        hidden: { opacity: 0, ...slideOffset[direction] },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration, ease: "easeOut" },
        },
      };
    case "scale":
      return {
        hidden: { opacity: 0, scale: 0.85 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { duration, ease: "easeOut" },
        },
      };
    case "fade":
    default:
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration } },
      };
  }
};

export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  animationType = "fade",
  direction = "up",
  duration = 0.5,
  delay = 0,
  className,
  once = true,
  triggerOnMount = false,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-10% 0px" });
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const childVariants = getChildVariants(
    animationType,
    direction,
    duration,
    !!prefersReducedMotion,
  );

  const animate = triggerOnMount || isInView ? "visible" : "hidden";

  return (
    <StaggerItemVariantsContext.Provider value={childVariants}>
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={animate}
        className={className}
      >
        {children}
      </motion.div>
    </StaggerItemVariantsContext.Provider>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const variants = useContext(StaggerItemVariantsContext);
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}
