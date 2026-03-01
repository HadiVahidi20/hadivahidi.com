"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => null,
});

function useDeviceCapability() {
  if (typeof window === "undefined") return "desktop";
  const isMobile = window.innerWidth < 768;
  return isMobile ? "mobile" : "desktop";
}

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const device = useDeviceCapability();

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 3D scene — desktop only */}
      {device === "desktop" && !prefersReducedMotion && <HeroScene />}

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
          style={{
            backgroundColor: "rgba(var(--accent-rgb), 0.1)",
            color: "var(--accent)",
            border: "1px solid rgba(var(--accent-rgb), 0.2)",
          }}
          custom={0}
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: "#22c55e" }}
          />
          Available for work
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          style={{ fontFamily: "var(--font-display)" }}
          custom={1}
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          Hadi Vahidi
        </motion.h1>

        <motion.p
          className="text-xl sm:text-2xl mb-4"
          style={{ color: "var(--text-light)" }}
          custom={2}
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          Front-End Developer
        </motion.p>

        <motion.p
          className="text-base sm:text-lg max-w-lg mx-auto mb-10"
          style={{ color: "var(--muted)" }}
          custom={3}
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          Crafting exceptional digital experiences with clean code and
          intuitive user interfaces.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          custom={4}
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          <a
            href="#work"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-white font-medium transition-all hover:scale-105"
            style={{ backgroundColor: "var(--accent)" }}
          >
            View My Work
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-medium transition-all hover:scale-105"
            style={{
              border: "1px solid var(--border-color)",
              color: "var(--text)",
            }}
          >
            Get In Touch
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div
            className="w-6 h-10 rounded-full flex justify-center pt-2"
            style={{ border: "2px solid var(--border-color)" }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--accent)" }}
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}
