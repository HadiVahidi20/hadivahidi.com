import { Metadata } from "next";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import ProjectsGrid from "./ProjectsGrid";

export const metadata: Metadata = {
  title: "Projects",
  description: "A showcase of my recent work and side projects.",
};

async function getProjects() {
  try {
    const data = await db.query.projects.findMany({
      where: eq(projects.isActive, 1),
      with: { images: true, links: true, highlights: true },
      orderBy: [asc(projects.sortOrder), desc(projects.createdAt)],
    });

    return data.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      subtitle: p.subtitle,
      shortDescription: p.shortDescription,
      thumbnail: p.thumbnail,
      technologies: p.technologies
        ? p.technologies.split(",").map((t: string) => t.trim())
        : [],
      status: p.status,
      isFeatured: Boolean(p.isFeatured),
      links: p.links
        .filter((l) => l.isActive)
        .map((l) => ({ linkType: l.linkType, url: l.url, title: l.title })),
    }));
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const projectList = await getProjects();

  return (
    <main id="main-content" className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h1
          className="text-4xl sm:text-5xl font-bold mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Projects
        </h1>
        <p className="text-lg mb-12" style={{ color: "var(--text-light)" }}>
          A showcase of my recent work and side projects.
        </p>
        <ProjectsGrid projects={projectList} />
      </div>
    </main>
  );
}
