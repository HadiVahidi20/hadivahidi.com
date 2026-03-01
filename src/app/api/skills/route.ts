import { db } from "@/db";
import { skills, skillCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { successResponse, handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const categories = await db.query.skillCategories.findMany({
      where: eq(skillCategories.isActive, 1),
      with: {
        skills: {
          where: eq(skills.isActive, 1),
          orderBy: [asc(skills.sortOrder)],
        },
      },
      orderBy: [asc(skillCategories.sortOrder)],
    });

    const formatted = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      color: category.color,
      skills: category.skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        slug: skill.slug,
        proficiencyLevel: skill.proficiencyLevel,
        icon: skill.icon,
        color: skill.color,
        yearsExperience: skill.yearsExperience,
        isFeatured: Boolean(skill.isFeatured),
      })),
    }));

    return successResponse(formatted);
  } catch (error) {
    return handleApiError(error);
  }
}
