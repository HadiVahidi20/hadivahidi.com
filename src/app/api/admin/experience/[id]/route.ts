import { NextRequest } from "next/server";
import { db } from "@/db";
import { experienceItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  location: z.string().nullable().optional(),
  position: z.string().optional(),
  employmentType: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  isCurrent: z.number().int().min(0).max(1).optional(),
  technologies: z.any().optional(),
  achievements: z.any().optional(),
  companyLogo: z.string().nullable().optional(),
  companyWebsite: z.string().nullable().optional(),
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
    const item = await db.query.experienceItems.findFirst({
      where: eq(experienceItems.id, Number(id)),
    });
    if (!item) return errorResponse("Experience item not found", 404);
    return successResponse(item);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(experienceItems).set(data as any).where(eq(experienceItems.id, Number(id)));
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
    await db.delete(experienceItems).where(eq(experienceItems.id, Number(id)));
    return successResponse({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
