import { NextRequest } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, handleApiError } from "@/lib/api-utils";

const updateSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string(),
    }),
  ),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = await db.query.settings.findMany();
    const map: Record<string, string> = {};
    data.forEach((s) => {
      map[s.settingKey] = s.settingValue || "";
    });
    return successResponse(map);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { settings: items } = updateSchema.parse(body);

    await Promise.all(
      items.map(async (item) => {
        const existing = await db.query.settings.findFirst({
          where: eq(settings.settingKey, item.key),
        });
        if (existing) {
          await db
            .update(settings)
            .set({ settingValue: item.value })
            .where(eq(settings.settingKey, item.key));
        } else {
          await db.insert(settings).values({
            settingKey: item.key,
            settingValue: item.value,
          });
        }
      }),
    );

    return successResponse({ updated: true });
  } catch (e) {
    return handleApiError(e);
  }
}
