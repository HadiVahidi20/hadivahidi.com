import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProject(slug: string) {
  try {
    return await db.query.projects.findFirst({
      where: and(eq(projects.slug, slug), eq(projects.isActive, 1)),
      with: { images: true, links: true, highlights: true },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: project.title,
    description: project.shortDescription || project.subtitle || "",
    openGraph: {
      title: project.title,
      description: project.shortDescription || "",
      images: project.thumbnail ? [{ url: project.thumbnail }] : [],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const technologies = project.technologies
    ? project.technologies.split(",").map((t: string) => t.trim())
    : [];
  const activeLinks = project.links.filter((l) => l.isActive);
  const activeImages = project.images
    .filter((i) => i.isActive)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const activeHighlights = project.highlights
    .filter((h) => h.isActive)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <main id="main-content" className="min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm mb-8 transition-colors hover:text-[var(--accent)]"
          style={{ color: "var(--text-light)" }}
        >
          &larr; Back to Projects
        </Link>

        {/* Hero image */}
        {project.thumbnail && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
          </div>
        )}

        {/* Title & meta */}
        <h1
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {project.title}
        </h1>
        {project.subtitle && (
          <p className="text-lg mb-6" style={{ color: "var(--text-light)" }}>
            {project.subtitle}
          </p>
        )}

        {/* Tech stack */}
        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-sm rounded-full font-medium"
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

        {/* Links */}
        {activeLinks.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-10">
            {activeLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor:
                    link.linkType === "demo" ? "var(--accent)" : "var(--bg-alt)",
                  color: link.linkType === "demo" ? "white" : "var(--text)",
                  border:
                    link.linkType === "demo"
                      ? "none"
                      : "1px solid var(--border-color)",
                }}
              >
                {link.title || link.linkType || "Link"}
              </a>
            ))}
          </div>
        )}

        {/* Description */}
        {project.description && (
          <div
            className="prose max-w-none mb-10"
            style={{ color: "var(--text)" }}
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
        )}

        {/* Highlights */}
        {activeHighlights.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Key Highlights</h2>
            <ul className="space-y-2">
              {activeHighlights.map((h) => (
                <li
                  key={h.id}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: "var(--text-light)" }}
                >
                  <span style={{ color: "var(--accent)" }}>&#10003;</span>
                  {h.highlightText}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Image gallery */}
        {activeImages.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeImages.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-video rounded-xl overflow-hidden"
                >
                  <Image
                    src={img.imagePath}
                    alt={img.altText || project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 448px"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              name: project.title,
              description: project.shortDescription || project.subtitle,
              image: project.thumbnail,
              author: {
                "@type": "Person",
                name: "Hadi Vahidi",
              },
            }),
          }}
        />
      </div>
    </main>
  );
}
