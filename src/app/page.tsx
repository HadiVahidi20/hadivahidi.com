import { db } from "@/db";
import { projects, skills, skillCategories, experienceItems, articles, profileData, settings } from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import {
  Hero,
  About,
  Skills,
  Projects,
  Experience,
  Articles,
  Contact,
  Footer,
} from "@/components/sections";

async function getHomeData() {
  try {
    const [profile, skillData, projectData, experienceData, articleData] =
      await Promise.all([
        db.query.profileData.findFirst(),
        db.query.skillCategories.findMany({
          where: eq(skillCategories.isActive, 1),
          with: {
            skills: {
              where: eq(skills.isActive, 1),
              orderBy: [asc(skills.sortOrder)],
            },
          },
          orderBy: [asc(skillCategories.sortOrder)],
        }),
        db.query.projects.findMany({
          where: and(eq(projects.isActive, 1), eq(projects.isFeatured, 1)),
          with: { images: true, links: true, highlights: true },
          orderBy: [asc(projects.sortOrder)],
          limit: 6,
        }),
        db.query.experienceItems.findMany({
          where: eq(experienceItems.isActive, 1),
          orderBy: [asc(experienceItems.sortOrder)],
        }),
        db.query.articles.findMany({
          where: eq(articles.status, "published"),
          with: { category: true },
          orderBy: [desc(articles.publishedAt)],
          limit: 3,
        }),
      ]);

    return { profile, skillData, projectData, experienceData, articleData };
  } catch {
    // DB not connected yet — return empty data
    return {
      profile: null,
      skillData: [],
      projectData: [],
      experienceData: [],
      articleData: [],
    };
  }
}

export default async function Home() {
  const { profile, skillData, projectData, experienceData, articleData } =
    await getHomeData();

  const formattedProfile = profile
    ? {
        name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
        title: profile.professionalTitle || "",
        bio: profile.bio || "",
        about: profile.about || "",
        location: profile.location || "",
        profileImage: profile.profileImage || "",
        isAvailable: Boolean(profile.isAvailable),
      }
    : null;

  const formattedProjects = projectData.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    subtitle: p.subtitle,
    shortDescription: p.shortDescription,
    thumbnail: p.thumbnail,
    technologies: p.technologies
      ? p.technologies.split(",").map((t: string) => t.trim())
      : [],
    isFeatured: Boolean(p.isFeatured),
    links: p.links
      .filter((l) => l.isActive)
      .map((l) => ({ linkType: l.linkType, url: l.url, title: l.title })),
  }));

  const formattedSkills = skillData.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    color: cat.color,
    skills: cat.skills.map((s) => ({
      id: s.id,
      name: s.name,
      proficiencyLevel: s.proficiencyLevel,
      icon: s.icon,
      color: s.color,
      isFeatured: Boolean(s.isFeatured),
    })),
  }));

  const formattedExperience = experienceData.map((e) => ({
    id: e.id,
    title: e.title,
    company: e.company,
    location: e.location,
    position: e.position,
    employmentType: e.employmentType,
    description: e.description,
    startDate: String(e.startDate),
    endDate: e.endDate ? String(e.endDate) : null,
    isCurrent: Boolean(e.isCurrent),
    technologies: e.technologies,
  }));

  const formattedArticles = articleData.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    featuredImage: a.featuredImage,
    category: a.category
      ? { name: a.category.name, color: a.category.color }
      : null,
    publishedAt: a.publishedAt ? String(a.publishedAt) : null,
    readingTime: a.readingTime,
  }));

  return (
    <>
      <main id="main-content">
        <Hero />
        <About profile={formattedProfile} />
        <Skills categories={formattedSkills} />
        <Projects projects={formattedProjects} />
        <Experience items={formattedExperience} />
        <Articles articles={formattedArticles} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
