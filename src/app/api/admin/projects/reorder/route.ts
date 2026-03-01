import { NextRequest } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, handleApiError } from "@/lib/api-utils";

const reorderSchema = z.object({
  items: z.array(z.object({ id: z.number(), sortOrder: z.number() })),
});

export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { items } = reorderSchema.parse(body);

    await Promise.all(
      items.map((item) =>
        db.update(projects).set({ sortOrder: item.sortOrder }).where(eq(projects.id, item.id)),
      ),
    );

    return successResponse({ reordered: true });
  } catch (e) {
    return handleApiError(e);
  }
}
