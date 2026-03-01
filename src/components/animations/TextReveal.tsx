"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, type Easing } from "framer-motion";

type Direction = "up" | "down" | "left" | "right";
type SplitBy = "words" | "characters";

interface TextRevealProps {
  text: string;
  splitBy?: SplitBy;
  direction?: Direction;
  staggerDelay?: number;
  duration?: number;
  delay?: number;
  className?: string;
  once?: boolean;
}

const getDirectionVariants = (direction: Direction) => {
  const distance = 40;
  const offsets: Record<Direction, { x: number; y: number }> = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };
  return offsets[direction];
};

export function TextReveal({
  text,
  splitBy = "words",
  direction = "up",
  staggerDelay = 0.05,
  duration = 0.6,
  delay = 0,
  className,
  once = true,
}: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, margin: "-10% 0px" });
  const prefersReducedMotion = useReducedMotion();

  const tokens =
    splitBy === "words"
      ? text.split(/\s+/).map((word, i, arr) =>
          i < arr.length - 1 ? word + "\u00A0" : word,
        )
      : text.split("");

  const { x: ox, y: oy } = getDirectionVariants(direction);

  const easeOut: Easing = "easeOut";

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const childVariants = {
    hidden: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, x: ox, y: oy },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : duration, ease: easeOut },
    },
  };

  return (
    <motion.span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      style={{ display: "inline" }}
    >
      {/* Accessible text for screen readers */}
      <span className="sr-only">{text}</span>
      {tokens.map((token, i) => (
        <span
          key={`${i}-${token}`}
          style={{ display: splitBy === "words" ? "inline" : "inline-block", overflow: "hidden" }}
        >
          <motion.span
            variants={childVariants}
            style={{ display: "inline-block" }}
            aria-hidden="true"
          >
            {token}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
