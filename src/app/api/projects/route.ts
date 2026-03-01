import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and, like, sql, asc, desc } from "drizzle-orm";
import { z } from "zod";
import {
  successResponse,
  paginatedResponse,
  handleApiError,
} from "@/lib/api-utils";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  per_page: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  status: z.string().optional().default("active"),
  featured: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));

    const conditions = [];

    if (params.status === "active") {
      conditions.push(eq(projects.isActive, 1));
    }

    if (params.featured === "true") {
      conditions.push(eq(projects.isFeatured, 1));
    }

    if (params.search) {
      conditions.push(like(projects.title, `%${params.search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (params.page - 1) * params.per_page;

    const [projectList, countResult] = await Promise.all([
      db.query.projects.findMany({
        where,
        with: {
          images: true,
          links: true,
          highlights: true,
        },
        orderBy: [asc(projects.sortOrder), desc(projects.createdAt)],
        limit: params.per_page,
        offset,
      }),
      db
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(where),
    ]);

    const total = countResult[0]?.count ?? 0;

    const formatted = projectList.map((project) => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      subtitle: project.subtitle,
      shortDescription: project.shortDescription,
      thumbnail: project.thumbnail,
      technologies: project.technologies
        ? project.technologies.split(",").map((t: string) => t.trim())
        : [],
      status: project.status,
      isFeatured: Boolean(project.isFeatured),
      images: project.images
        .filter((img) => img.isActive)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
      links: project.links
        .filter((link) => link.isActive)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
      highlights: project.highlights
        .filter((h) => h.isActive)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    }));

    return paginatedResponse(formatted, {
      page: params.page,
      perPage: params.per_page,
      total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
