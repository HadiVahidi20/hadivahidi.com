import { NextRequest } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, handleApiError } from "@/lib/api-utils";

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.string().optional(),
  isFeatured: z.number().int().min(0).max(1).optional(),
  categoryId: z.number().int().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  readingTime: z.number().int().optional(),
  publishedAt: z.string().optional(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = await db.query.articles.findMany({
      with: { category: true, author: true },
      orderBy: [desc(articles.updatedAt)],
    });
    return successResponse(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const data = createSchema.parse(body);
    const result = await db.insert(articles).values({
      ...data,
      authorId: Number(session!.user.id),
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    });
    return successResponse({ id: result[0].insertId }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
