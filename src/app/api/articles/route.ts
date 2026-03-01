import { db } from "@/db";
import { articles, settings } from "@/db/schema";
import { eq, and, like, sql, desc } from "drizzle-orm";
import { z } from "zod";
import {
  successResponse,
  paginatedResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-utils";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  per_page: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  category: z.coerce.number().optional(),
  featured: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    // Check if articles are enabled
    const articlesEnabled = await db.query.settings.findFirst({
      where: eq(settings.settingKey, "articles_enabled"),
    });

    if (articlesEnabled?.settingValue !== "1") {
      return errorResponse("Articles section is disabled", 404);
    }

    const { searchParams } = new URL(request.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));

    const conditions = [eq(articles.status, "published")];

    if (params.featured === "true") {
      conditions.push(eq(articles.isFeatured, 1));
    }

    if (params.category) {
      conditions.push(eq(articles.categoryId, params.category));
    }

    if (params.search) {
      conditions.push(like(articles.title, `%${params.search}%`));
    }

    const where = and(...conditions);
    const offset = (params.page - 1) * params.per_page;

    const [articleList, countResult] = await Promise.all([
      db.query.articles.findMany({
        where,
        with: {
          author: true,
          category: true,
          tagRelationships: {
            with: { tag: true },
          },
        },
        orderBy: [desc(articles.publishedAt)],
        limit: params.per_page,
        offset,
      }),
      db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(where),
    ]);

    const total = countResult[0]?.count ?? 0;

    const formatted = articleList.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      featuredImage: article.featuredImage,
      category: article.category
        ? {
            id: article.category.id,
            name: article.category.name,
            color: article.category.color,
          }
        : null,
      author: article.author
        ? {
            name:
              `${article.author.firstName || ""} ${article.author.lastName || ""}`.trim(),
          }
        : null,
      tags: article.tagRelationships.map((tr) => ({
        id: tr.tag.id,
        name: tr.tag.name,
        slug: tr.tag.slug,
        color: tr.tag.color,
      })),
      publishedAt: article.publishedAt,
      readingTime: article.readingTime,
      viewCount: article.viewCount,
      isFeatured: Boolean(article.isFeatured),
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
