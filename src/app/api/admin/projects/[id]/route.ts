import { NextRequest } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  subtitle: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  technologies: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  isFeatured: z.number().int().min(0).max(1).optional(),
  isActive: z.number().int().min(0).max(1).optional(),
  sortOrder: z.number().int().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, Number(id)),
      with: { images: true, links: true, highlights: true },
    });
    if (!project) return errorResponse("Project not found", 404);
    return successResponse(project);
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
    await db.update(projects).set(data).where(eq(projects.id, Number(id)));
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
    await db.delete(projects).where(eq(projects.id, Number(id)));
    return successResponse({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
