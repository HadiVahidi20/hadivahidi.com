import { NextRequest } from "next/server";
import { db } from "@/db";
import { skills } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, handleApiError } from "@/lib/api-utils";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  categoryId: z.number().int().optional(),
  proficiencyLevel: z.number().int().min(0).max(100).optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  isFeatured: z.number().int().min(0).max(1).optional(),
  isActive: z.number().int().min(0).max(1).optional(),
  sortOrder: z.number().int().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);
    await db.update(skills).set(data).where(eq(skills.id, Number(id)));
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
    await db.delete(skills).where(eq(skills.id, Number(id)));
    return successResponse({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
