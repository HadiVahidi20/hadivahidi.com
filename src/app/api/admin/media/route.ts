import { NextRequest } from "next/server";
import { db } from "@/db";
import { mediaFiles, mediaFolders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const [files, folders] = await Promise.all([
      db.query.mediaFiles.findMany({
        where: eq(mediaFiles.isActive, 1),
        orderBy: [desc(mediaFiles.createdAt)],
      }),
      db.query.mediaFolders.findMany({
        where: eq(mediaFolders.isActive, 1),
      }),
    ]);
    return successResponse({ files, folders });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folderId = formData.get("folderId") as string | null;

    if (!file) return errorResponse("No file provided", 400);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);

    const result = await db.insert(mediaFiles).values({
      originalName: file.name,
      fileName,
      filePath: `/uploads/${fileName}`,
      fileType: file.type,
      fileSize: file.size,
      folderId: folderId ? Number(folderId) : null,
    });

    return successResponse(
      {
        id: result[0].insertId,
        filePath: `/uploads/${fileName}`,
        fileName,
      },
      201,
    );
  } catch (e) {
    return handleApiError(e);
  }
}
