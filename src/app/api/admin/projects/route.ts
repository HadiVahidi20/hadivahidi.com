import { NextRequest } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  subtitle: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  technologies: z.string().optional(),
  status: z.string().optional(),
  isFeatured: z.number().int().min(0).max(1).optional(),
  isActive: z.number().int().min(0).max(1).optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = await db.query.projects.findMany({
      with: { images: true, links: true, highlights: true },
      orderBy: [asc(projects.sortOrder), desc(projects.createdAt)],
    });
    return successResponse(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const data = createSchema.parse(body);
    const result = await db.insert(projects).values(data);
    return successResponse({ id: result[0].insertId }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
