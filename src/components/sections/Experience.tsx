"use client";

import { motion } from "framer-motion";

interface ExperienceItem {
  id: number;
  title: string;
  company: string;
  location: string | null;
  position: string;
  employmentType: string | null;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  technologies: string[] | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5 },
  }),
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function TimelineItem({
  item,
  index,
}: {
  item: ExperienceItem;
  index: number;
}) {
  return (
    <motion.div
      className="relative pl-8 pb-12 last:pb-0"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeUp}
      custom={index}
    >
      {/* Timeline line */}
      <div
        className="absolute left-[11px] top-2 bottom-0 w-px"
        style={{ backgroundColor: "var(--border-color)" }}
      />
      {/* Timeline dot */}
      <div
        className="absolute left-0 top-2 w-[23px] h-[23px] rounded-full border-[3px] z-10"
        style={{
          borderColor: item.isCurrent ? "var(--accent)" : "var(--border-color)",
          backgroundColor: item.isCurrent ? "var(--accent)" : "var(--bg)",
        }}
      />

      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: "var(--bg-alt)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            {formatDate(item.startDate)} —{" "}
            {item.isCurrent ? "Present" : item.endDate ? formatDate(item.endDate) : ""}
          </span>
          {item.isCurrent && (
            <span
              className="px-2 py-0.5 text-xs rounded-full font-medium"
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                color: "#22c55e",
              }}
            >
              Current
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold">{item.position}</h3>
        <p className="text-sm mb-3" style={{ color: "var(--text-light)" }}>
          {item.company}
          {item.location && ` · ${item.location}`}
          {item.employmentType && ` · ${item.employmentType}`}
        </p>
        {item.description && (
          <p
            className="text-sm mb-4 line-clamp-3"
            style={{ color: "var(--muted)" }}
          >
            {item.description}
          </p>
        )}
        {item.technologies && item.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-xs rounded-full"
                style={{
                  backgroundColor: "rgba(var(--accent-rgb), 0.1)",
                  color: "var(--accent)",
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Experience({
  items,
}: {
  items?: ExperienceItem[] | null;
}) {
  const data = items || [];

  return (
    <section id="experience" className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--font-display)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
        >
          Experience
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

        <div>
          {data.map((item, i) => (
            <TimelineItem key={item.id} item={item} index={i + 2} />
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
              Experience data will appear here once connected to the database.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
