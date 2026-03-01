"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface Project {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  shortDescription: string | null;
  thumbnail: string | null;
  technologies: string[];
  isFeatured: boolean;
  links: { linkType: string | null; url: string; title: string | null }[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      className="group rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "var(--bg-alt)",
        border: "1px solid var(--border-color)",
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(var(--accent-rgb), 0.1)" }}
          >
            <span
              className="text-3xl font-bold"
              style={{ color: "var(--accent)" }}
            >
              {project.title.charAt(0)}
            </span>
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link
            href={`/projects/${project.slug}`}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            View Details
          </Link>
          {project.links[0] && (
            <a
              href={project.links[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white border border-white/30"
            >
              Live Demo
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-1">{project.title}</h3>
        {project.subtitle && (
          <p className="text-sm mb-3" style={{ color: "var(--text-light)" }}>
            {project.subtitle}
          </p>
        )}
        {project.shortDescription && (
          <p
            className="text-sm mb-4 line-clamp-2"
            style={{ color: "var(--muted)" }}
          >
            {project.shortDescription}
          </p>
        )}
        {/* Tech stack pills */}
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-0.5 text-xs rounded-full font-medium"
              style={{
                backgroundColor: "rgba(var(--accent-rgb), 0.1)",
                color: "var(--accent)",
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects({
  projects,
}: {
  projects?: Project[] | null;
}) {
  const data = projects || [];

  return (
    <section id="work" className="py-24 px-4">
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
          Featured Work
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i + 2} />
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
              Projects will appear here once connected to the database.
            </p>
          </div>
        )}

        {data.length > 0 && (
          <motion.div
            className="text-center mt-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={5}
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{
                border: "1px solid var(--border-color)",
                color: "var(--text)",
              }}
            >
              View All Projects &rarr;
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
