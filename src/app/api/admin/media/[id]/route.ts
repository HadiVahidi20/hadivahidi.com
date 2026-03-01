import { NextRequest } from "next/server";
import { db } from "@/db";
import { mediaFiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, handleApiError } from "@/lib/api-utils";

const updateSchema = z.object({
  altText: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  folderId: z.number().int().nullable().optional(),
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
    await db.update(mediaFiles).set(data).where(eq(mediaFiles.id, Number(id)));
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
    await db.update(mediaFiles).set({ isActive: 0 }).where(eq(mediaFiles.id, Number(id)));
    return successResponse({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
