import { Metadata } from "next";
import { db } from "@/db";
import { articles, articleCategories } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import ArticlesGrid from "./ArticlesGrid";

export const metadata: Metadata = {
  title: "Articles",
  description: "Thoughts on web development, design, and technology.",
};

async function getArticles() {
  try {
    const [data, categories] = await Promise.all([
      db.query.articles.findMany({
        where: eq(articles.status, "published"),
        with: { category: true, tagRelationships: { with: { tag: true } } },
        orderBy: [desc(articles.publishedAt)],
      }),
      db.query.articleCategories.findMany({
        where: eq(articleCategories.isActive, 1),
        orderBy: [asc(articleCategories.sortOrder)],
      }),
    ]);

    return {
      articles: data.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        featuredImage: a.featuredImage,
        category: a.category
          ? { name: a.category.name, slug: a.category.slug, color: a.category.color }
          : null,
        tags: a.tagRelationships.map((tr) => ({
          name: tr.tag.name,
          slug: tr.tag.slug,
        })),
        publishedAt: a.publishedAt ? String(a.publishedAt) : null,
        readingTime: a.readingTime,
      })),
      categories: categories.map((c) => ({
        name: c.name,
        slug: c.slug,
        color: c.color,
      })),
    };
  } catch {
    return { articles: [], categories: [] };
  }
}

export default async function ArticlesPage() {
  const { articles: articleList, categories } = await getArticles();

  return (
    <main id="main-content" className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h1
          className="text-4xl sm:text-5xl font-bold mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Articles
        </h1>
        <p className="text-lg mb-12" style={{ color: "var(--text-light)" }}>
          Thoughts on web development, design, and technology.
        </p>
        <ArticlesGrid articles={articleList} categories={categories} />
      </div>
    </main>
  );
}
