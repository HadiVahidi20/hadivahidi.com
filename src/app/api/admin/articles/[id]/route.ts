import { NextRequest } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  featuredImage: z.string().nullable().optional(),
  status: z.string().optional(),
  isFeatured: z.number().int().min(0).max(1).optional(),
  categoryId: z.number().int().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  readingTime: z.number().int().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, Number(id)),
      with: { category: true, author: true, tagRelationships: { with: { tag: true } } },
    });
    if (!article) return errorResponse("Article not found", 404);
    return successResponse(article);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);
    const updateData: Record<string, unknown> = { ...data };
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
    }
    await db.update(articles).set(updateData).where(eq(articles.id, Number(id)));
    return successResponse({ id: Number(id) });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await db.delete(articles).where(eq(articles.id, Number(id)));
    return successResponse({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
