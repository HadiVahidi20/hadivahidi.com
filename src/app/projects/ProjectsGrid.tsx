"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  status: string | null;
  isFeatured: boolean;
  links: { linkType: string | null; url: string; title: string | null }[];
}

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<string>("all");

  const allTechs = useMemo(() => {
    const techs = new Set<string>();
    projects.forEach((p) => p.technologies.forEach((t) => techs.add(t)));
    return ["all", ...Array.from(techs).slice(0, 8)];
  }, [projects]);

  const filtered = useMemo(() => {
    if (filter === "all") return projects;
    return projects.filter((p) => p.technologies.includes(filter));
  }, [filter, projects]);

  return (
    <>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {allTechs.map((tech) => (
          <button
            key={tech}
            onClick={() => setFilter(tech)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor:
                filter === tech
                  ? "var(--accent)"
                  : "var(--bg-alt)",
              color:
                filter === tech ? "white" : "var(--text-light)",
              border: `1px solid ${filter === tech ? "var(--accent)" : "var(--border-color)"}`,
            }}
          >
            {tech === "all" ? "All" : tech}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="group rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--bg-alt)",
                border: "1px solid var(--border-color)",
              }}
            >
              <Link href={`/projects/${project.slug}`}>
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
                      <span className="text-3xl font-bold" style={{ color: "var(--accent)" }}>
                        {project.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-1">{project.title}</h3>
                  {project.shortDescription && (
                    <p className="text-sm line-clamp-2 mb-3" style={{ color: "var(--text-light)" }}>
                      {project.shortDescription}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 4).map((tech) => (
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
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p style={{ color: "var(--text-light)" }}>No projects found for this filter.</p>
        </div>
      )}
    </>
  );
}
