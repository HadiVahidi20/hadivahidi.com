import { NextRequest } from "next/server";
import { db } from "@/db";
import { skills, skillCategories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  color: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

const createSkillSchema = z.object({
  name: z.string().min(1),
  categoryId: z.number().int(),
  proficiencyLevel: z.number().int().min(0).max(100).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isFeatured: z.number().int().min(0).max(1).optional(),
  isActive: z.number().int().min(0).max(1).optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = await db.query.skillCategories.findMany({
      with: { skills: { orderBy: [asc(skills.sortOrder)] } },
      orderBy: [asc(skillCategories.sortOrder)],
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
    const { type } = body;

    if (type === "category") {
      const data = createCategorySchema.parse(body);
      const result = await db.insert(skillCategories).values(data);
      return successResponse({ id: result[0].insertId }, 201);
    }

    const data = createSkillSchema.parse(body);
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const result = await db.insert(skills).values({ ...data, slug });
    return successResponse({ id: result[0].insertId }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
