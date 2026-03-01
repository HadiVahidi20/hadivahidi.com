import { db } from "@/db";
import { projects, articles, experienceItems, skills, mediaFiles } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, handleApiError } from "@/lib/api-utils";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    // Build a simple activity feed from recent content updates
    const [recentProjects, recentArticles, recentExperience, stats] = await Promise.all([
      db.query.projects.findMany({
        columns: { id: true, title: true, updatedAt: true, createdAt: true },
        orderBy: [desc(projects.updatedAt)],
        limit: 10,
      }),
      db.query.articles.findMany({
        columns: { id: true, title: true, updatedAt: true, createdAt: true, status: true },
        orderBy: [desc(articles.updatedAt)],
        limit: 10,
      }),
      db.query.experienceItems.findMany({
        columns: { id: true, title: true, updatedAt: true, createdAt: true },
        orderBy: [desc(experienceItems.updatedAt)],
        limit: 10,
      }),
      Promise.all([
        db.select({ value: count() }).from(projects),
        db.select({ value: count() }).from(articles),
        db.select({ value: count() }).from(skills),
        db.select({ value: count() }).from(experienceItems),
        db.select({ value: count() }).from(mediaFiles),
      ]),
    ]);

    // Merge into a unified activity feed sorted by updatedAt
    const activity = [
      ...recentProjects.map((p) => ({ type: "project" as const, ...p })),
      ...recentArticles.map((a) => ({ type: "article" as const, ...a })),
      ...recentExperience.map((e) => ({ type: "experience" as const, ...e })),
    ].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    }).slice(0, 20);

    return successResponse({
      activity,
      totals: {
        projects: stats[0][0]?.value || 0,
        articles: stats[1][0]?.value || 0,
        skills: stats[2][0]?.value || 0,
        experience: stats[3][0]?.value || 0,
        media: stats[4][0]?.value || 0,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
