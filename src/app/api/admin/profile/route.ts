import { NextRequest } from "next/server";
import { db } from "@/db";
import { profileData } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

const updateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  professionalTitle: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  bio: z.string().optional(),
  about: z.string().optional(),
  profileImage: z.string().optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
  skillsHighlights: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  isAvailable: z.number().int().min(0).max(1).optional(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const rows = await db.select().from(profileData).limit(1);
    if (!rows[0]) return errorResponse("Profile not found", 404);
    return successResponse(rows[0]);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);
    const existing = await db.select().from(profileData).limit(1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (existing[0]) {
      await db.update(profileData).set(data as any).where(eq(profileData.id, existing[0].id));
    } else {
      await db.insert(profileData).values(data as any);
    }

    return successResponse({ updated: true });
  } catch (e) {
    return handleApiError(e);
  }
}
