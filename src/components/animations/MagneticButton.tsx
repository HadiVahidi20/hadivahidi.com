"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useSpring } from "framer-motion";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: "button";
};
type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  as: "a";
};
type DivProps = React.HTMLAttributes<HTMLDivElement> & {
  as: "div";
};

type MagneticButtonProps = (ButtonProps | AnchorProps | DivProps) & {
  children: React.ReactNode;
  radius?: number;
  strength?: number;
  wrapperClassName?: string;
};

export function MagneticButton({
  children,
  radius = 100,
  strength = 0.4,
  wrapperClassName,
  as: Tag = "button",
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Detect touch device on initial render (safe: window not accessed on server)
  const [isTouchDevice] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(pointer: coarse)").matches;
  });

  const springConfig = { stiffness: 200, damping: 20, mass: 0.5 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current || prefersReducedMotion || isTouchDevice) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < radius) {
        x.set(distX * strength);
        y.set(distY * strength);
      }
    },
    [prefersReducedMotion, isTouchDevice, radius, strength, x, y],
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion || isTouchDevice) return;

    window.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave, prefersReducedMotion, isTouchDevice]);

  return (
    <motion.div
      ref={ref}
      style={prefersReducedMotion || isTouchDevice ? {} : { x, y }}
      className={wrapperClassName}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Tag {...(props as any)}>{children}</Tag>
    </motion.div>
  );
}
