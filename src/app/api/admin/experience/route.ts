import { NextRequest } from "next/server";
import { db } from "@/db";
import { experienceItems } from "@/db/schema";
import { asc } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, handleApiError } from "@/lib/api-utils";

const createSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  position: z.string().min(1),
  employmentType: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  isCurrent: z.number().int().min(0).max(1).optional(),
  technologies: z.any().optional(),
  achievements: z.any().optional(),
  companyLogo: z.string().optional(),
  companyWebsite: z.string().optional(),
  isActive: z.number().int().min(0).max(1).optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = await db.query.experienceItems.findMany({
      orderBy: [asc(experienceItems.sortOrder)],
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
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.insert(experienceItems).values({ ...data, slug } as any);
    return successResponse({ id: result[0].insertId }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
