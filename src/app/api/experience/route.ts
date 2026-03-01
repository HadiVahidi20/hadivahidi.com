import { db } from "@/db";
import { experienceItems } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { successResponse, handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const items = await db.query.experienceItems.findMany({
      where: eq(experienceItems.isActive, 1),
      orderBy: [asc(experienceItems.sortOrder)],
    });

    const formatted = items.map((item) => ({
      id: item.id,
      title: item.title,
      company: item.company,
      location: item.location,
      position: item.position,
      employmentType: item.employmentType,
      description: item.description,
      startDate: item.startDate,
      endDate: item.endDate,
      isCurrent: Boolean(item.isCurrent),
      technologies: item.technologies,
      achievements: item.achievements,
      companyLogo: item.companyLogo,
      companyWebsite: item.companyWebsite,
    }));

    return successResponse(formatted);
  } catch (error) {
    return handleApiError(error);
  }
}
