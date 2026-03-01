import { MetadataRoute } from "next";
import { db } from "@/db";
import { projects, articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hadivahidi.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/articles`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    const [projectData, articleData] = await Promise.all([
      db.query.projects.findMany({
        where: eq(projects.isActive, 1),
        columns: { slug: true, updatedAt: true },
      }),
      db.query.articles.findMany({
        where: eq(articles.status, "published"),
        columns: { slug: true, updatedAt: true },
        orderBy: [desc(articles.publishedAt)],
      }),
    ]);

    const projectPages: MetadataRoute.Sitemap = projectData.map((p) => ({
      url: `${BASE_URL}/projects/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    const articlePages: MetadataRoute.Sitemap = articleData.map((a) => ({
      url: `${BASE_URL}/articles/${a.slug}`,
      lastModified: a.updatedAt || new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...projectPages, ...articlePages];
  } catch {
    return staticPages;
  }
}
