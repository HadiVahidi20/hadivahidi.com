import { db } from "@/db";
import { profileData } from "@/db/schema";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const profile = await db.query.profileData.findFirst();

    if (!profile) {
      return errorResponse("Profile not found", 404);
    }

    return successResponse({
      name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
      title: profile.professionalTitle,
      bio: profile.bio,
      about: profile.about,
      location: profile.location,
      email: profile.email,
      website: profile.website,
      profileImage: profile.profileImage,
      socialLinks: profile.socialLinks,
      skillsHighlights: profile.skillsHighlights,
      isAvailable: Boolean(profile.isAvailable),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
