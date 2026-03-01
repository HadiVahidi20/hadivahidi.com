"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface ProfileData {
  name: string;
  title: string;
  bio: string;
  about: string;
  location: string;
  profileImage: string;
  isAvailable: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function About({ profile }: { profile?: ProfileData | null }) {
  return (
    <section id="about" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--font-display)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
        >
          About Me
        </motion.h2>
        <motion.div
          className="w-16 h-1 rounded-full mb-12"
          style={{ backgroundColor: "var(--accent)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
        />

        <div className="bento-grid" style={{ "--bento-cols": 4, "--bento-gap": "1.25rem" } as React.CSSProperties}>
          {/* Profile Image — large card */}
          <motion.div
            className="col-span-1 sm:col-span-2 row-span-2 rounded-2xl overflow-hidden relative min-h-[300px]"
            style={{
              backgroundColor: "var(--bg-alt)",
              border: "1px solid var(--border-color)",
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            {profile?.profileImage ? (
              <Image
                src={profile.profileImage}
                alt={profile.name || "Profile"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-6xl font-bold"
                  style={{ color: "var(--accent)" }}
                >
                  HV
                </span>
              </div>
            )}
          </motion.div>

          {/* Bio text */}
          <motion.div
            className="col-span-1 sm:col-span-2 rounded-2xl p-6"
            style={{
              backgroundColor: "var(--bg-alt)",
              border: "1px solid var(--border-color)",
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            <h3 className="text-lg font-semibold mb-3">Who I Am</h3>
            <p style={{ color: "var(--text-light)" }} className="leading-relaxed">
              {profile?.bio ||
                "A passionate front-end developer dedicated to creating beautiful, performant, and accessible web experiences."}
            </p>
          </motion.div>

          {/* Location */}
          <motion.div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: "var(--bg-alt)",
              border: "1px solid var(--border-color)",
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={2}
          >
            <div className="text-2xl mb-2">📍</div>
            <p className="text-sm font-medium">Location</p>
            <p style={{ color: "var(--text-light)" }} className="text-sm">
              {profile?.location || "Remote"}
            </p>
          </motion.div>

          {/* Experience counter */}
          <motion.div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: "var(--bg-alt)",
              border: "1px solid var(--border-color)",
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={3}
          >
            <p
              className="text-4xl font-bold mb-1"
              style={{ color: "var(--accent)" }}
            >
              5+
            </p>
            <p className="text-sm font-medium">Years Experience</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
