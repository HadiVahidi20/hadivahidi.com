import { db } from "@/db";
import { projects, articles, skills, skillCategories, experienceItems, profileData } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const [allProjects, allArticles, allSkillCategories, allSkills, allExperience, profile] =
      await Promise.all([
        db.query.projects.findMany({ with: { images: true, links: true, highlights: true } }),
        db.query.articles.findMany({ with: { category: true, tagRelationships: { with: { tag: true } } } }),
        db.query.skillCategories.findMany(),
        db.query.skills.findMany(),
        db.query.experienceItems.findMany(),
        db.query.profileData.findFirst(),
      ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      data: {
        profile,
        projects: allProjects,
        articles: allArticles,
        skillCategories: allSkillCategories,
        skills: allSkills,
        experience: allExperience,
      },
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="portfolio-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
