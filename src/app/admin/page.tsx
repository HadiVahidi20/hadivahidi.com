import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects, articles, skills, experienceItems, mediaFiles } from "@/db/schema";
import { eq, count, desc, sql } from "drizzle-orm";

async function getStats() {
  try {
    const [
      projectCount,
      articleCount,
      skillCount,
      experienceCount,
      mediaCount,
      recentArticles,
    ] = await Promise.all([
      db.select({ value: count() }).from(projects).where(eq(projects.isActive, 1)),
      db.select({ value: count() }).from(articles).where(eq(articles.status, "published")),
      db.select({ value: count() }).from(skills).where(eq(skills.isActive, 1)),
      db.select({ value: count() }).from(experienceItems).where(eq(experienceItems.isActive, 1)),
      db.select({ value: count() }).from(mediaFiles).where(eq(mediaFiles.isActive, 1)),
      db.query.articles.findMany({
        columns: { id: true, title: true, slug: true, status: true, publishedAt: true, viewCount: true },
        orderBy: [desc(articles.updatedAt)],
        limit: 5,
      }),
    ]);

    return {
      projects: projectCount[0]?.value || 0,
      articles: articleCount[0]?.value || 0,
      skills: skillCount[0]?.value || 0,
      experience: experienceCount[0]?.value || 0,
      media: mediaCount[0]?.value || 0,
      recentArticles,
    };
  } catch {
    return {
      projects: 0,
      articles: 0,
      skills: 0,
      experience: 0,
      media: 0,
      recentArticles: [],
    };
  }
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const stats = await getStats();

  const cards = [
    { label: "Projects", value: stats.projects, href: "/admin/projects", color: "#6366f1" },
    { label: "Articles", value: stats.articles, href: "/admin/articles", color: "#8b5cf6" },
    { label: "Skills", value: stats.skills, href: "/admin/skills", color: "#06b6d4" },
    { label: "Experience", value: stats.experience, href: "/admin/experience", color: "#10b981" },
    { label: "Media Files", value: stats.media, href: "/admin/media", color: "#f59e0b" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm" style={{ color: "var(--text-light)" }}>
          Welcome back, {session.user.firstName || session.user.name}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="rounded-xl p-5 transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: "var(--bg-alt)",
              border: "1px solid var(--border-color)",
            }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: "var(--text-light)" }}>
              {card.label}
            </p>
            <p className="text-3xl font-bold" style={{ color: card.color }}>
              {card.value}
            </p>
          </a>
        ))}
      </div>

      {/* Recent articles */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: "var(--bg-alt)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h2 className="font-semibold mb-4">Recent Articles</h2>
        {stats.recentArticles.length > 0 ? (
          <div className="space-y-3">
            {stats.recentArticles.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid var(--border-color)" }}
              >
                <div>
                  <a
                    href={`/admin/articles/${a.id}`}
                    className="text-sm font-medium hover:text-[var(--accent)] transition-colors"
                  >
                    {a.title}
                  </a>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-light)" }}>
                    {a.publishedAt
                      ? new Date(a.publishedAt).toLocaleDateString()
                      : "Draft"}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor:
                      a.status === "published"
                        ? "rgba(16, 185, 129, 0.1)"
                        : "rgba(245, 158, 11, 0.1)",
                    color: a.status === "published" ? "#10b981" : "#f59e0b",
                  }}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-light)" }}>
            No articles yet. Create your first article to get started.
          </p>
        )}
      </div>

      {/* Quick actions */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: "var(--bg-alt)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "New Project", href: "/admin/projects/new" },
            { label: "New Article", href: "/admin/articles/new" },
            { label: "Edit Profile", href: "/admin/profile" },
            { label: "Upload Media", href: "/admin/media" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: "rgba(var(--accent-rgb), 0.1)",
                color: "var(--accent)",
              }}
            >
              + {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
