import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  try {
    return await db.query.articles.findFirst({
      where: and(eq(articles.slug, slug), eq(articles.status, "published")),
      with: {
        category: true,
        author: true,
        tagRelationships: { with: { tag: true } },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || "",
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || "",
      type: "article",
      publishedTime: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : undefined,
      images: article.featuredImage
        ? [{ url: article.featuredImage }]
        : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const tags = article.tagRelationships.map((tr) => tr.tag);

  return (
    <main id="main-content" className="min-h-screen py-24 px-4">
      <article className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-1 text-sm mb-8 transition-colors hover:text-[var(--accent)]"
          style={{ color: "var(--text-light)" }}
        >
          &larr; Back to Articles
        </Link>

        {/* Category & date */}
        <div className="flex items-center gap-3 text-sm mb-4">
          {article.category && (
            <span
              className="px-3 py-1 text-xs font-medium rounded-full text-white"
              style={{
                backgroundColor: article.category.color || "var(--accent)",
              }}
            >
              {article.category.name}
            </span>
          )}
          {article.publishedAt && (
            <time style={{ color: "var(--text-light)" }}>
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          )}
          {article.readingTime && (
            <span style={{ color: "var(--text-light)" }}>
              {article.readingTime} min read
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl font-bold mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {article.title}
        </h1>

        {/* Author */}
        {article.author && (
          <div className="flex items-center gap-3 mb-8 pb-8" style={{ borderBottom: "1px solid var(--border-color)" }}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: "rgba(var(--accent-rgb), 0.1)",
                color: "var(--accent)",
              }}
            >
              {article.author.firstName?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-sm font-medium">
                {[article.author.firstName, article.author.lastName].filter(Boolean).join(" ") || "Author"}
              </p>
            </div>
          </div>
        )}

        {/* Featured image */}
        {article.featuredImage && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-10">
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {/* Content */}
        {article.content && (
          <div
            className="prose prose-lg max-w-none mb-10"
            style={{ color: "var(--text)" }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-8" style={{ borderTop: "1px solid var(--border-color)" }}>
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 text-sm rounded-full font-medium"
                style={{
                  backgroundColor: "rgba(var(--accent-rgb), 0.1)",
                  color: "var(--accent)",
                }}
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: article.title,
              description: article.excerpt,
              image: article.featuredImage,
              datePublished: article.publishedAt
                ? new Date(article.publishedAt).toISOString()
                : undefined,
              author: {
                "@type": "Person",
                name: article.author
                  ? [article.author.firstName, article.author.lastName].filter(Boolean).join(" ") || "Hadi Vahidi"
                  : "Hadi Vahidi",
              },
            }),
          }}
        />
      </article>
    </main>
  );
}
