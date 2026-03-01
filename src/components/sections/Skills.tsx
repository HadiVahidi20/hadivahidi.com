"use client";

import { motion } from "framer-motion";

interface SkillCategory {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  skills: {
    id: number;
    name: string;
    proficiencyLevel: number | null;
    icon: string | null;
    color: string | null;
    isFeatured: boolean;
  }[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

function SkillBar({ name, level, color }: { name: string; level: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">{name}</span>
        <span style={{ color: "var(--text-light)" }}>{level}%</span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--border-color)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" as const, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

export default function Skills({
  categories,
}: {
  categories?: SkillCategory[] | null;
}) {
  const data = categories || [];

  return (
    <section id="skills" className="py-24 px-4">
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
          Skills & Technologies
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.map((category, catIdx) => (
            <motion.div
              key={category.id}
              className="rounded-2xl p-6"
              style={{
                backgroundColor: "var(--bg-alt)",
                border: "1px solid var(--border-color)",
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={catIdx + 2}
            >
              <h3
                className="text-lg font-semibold mb-5 flex items-center gap-2"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color || "var(--accent)" }}
                />
                {category.name}
              </h3>
              <div className="space-y-4">
                {category.skills.map((skill) => (
                  <SkillBar
                    key={skill.id}
                    name={skill.name}
                    level={skill.proficiencyLevel || 50}
                    color={skill.color || category.color || "var(--accent)"}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {data.length === 0 && (
          <div
            className="text-center py-16 rounded-2xl"
            style={{
              backgroundColor: "var(--bg-alt)",
              border: "1px solid var(--border-color)",
            }}
          >
            <p style={{ color: "var(--text-light)" }}>
              Skills data will appear here once connected to the database.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
