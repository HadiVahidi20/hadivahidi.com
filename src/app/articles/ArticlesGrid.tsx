"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  category: { name: string; slug: string; color: string | null } | null;
  tags: { name: string; slug: string }[];
  publishedAt: string | null;
  readingTime: number | null;
}

interface Category {
  name: string;
  slug: string;
  color: string | null;
}

export default function ArticlesGrid({
  articles,
  categories,
}: {
  articles: Article[];
  categories: Category[];
}) {
  const [filter, setFilter] = useState<string>("all");

  const filters = useMemo(
    () => [{ name: "All", slug: "all", color: null }, ...categories],
    [categories],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return articles;
    return articles.filter((a) => a.category?.slug === filter);
  }, [filter, articles]);

  return (
    <>
      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setFilter(cat.slug)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor:
                  filter === cat.slug ? "var(--accent)" : "var(--bg-alt)",
                color: filter === cat.slug ? "white" : "var(--text-light)",
                border: `1px solid ${filter === cat.slug ? "var(--accent)" : "var(--border-color)"}`,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((article) => (
            <motion.article
              key={article.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="group rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--bg-alt)",
                border: "1px solid var(--border-color)",
              }}
            >
              <Link href={`/articles/${article.slug}`}>
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  {article.featuredImage ? (
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        backgroundColor: "rgba(var(--accent-rgb), 0.05)",
                      }}
                    >
                      <span className="text-3xl font-bold" style={{ color: "var(--accent)" }}>
                        {article.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {article.category && (
                    <span
                      className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full text-white"
                      style={{
                        backgroundColor:
                          article.category.color || "var(--accent)",
                      }}
                    >
                      {article.category.name}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div
                    className="flex items-center gap-3 text-xs mb-3"
                    style={{ color: "var(--text-light)" }}
                  >
                    {article.publishedAt && (
                      <time>
                        {new Date(article.publishedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </time>
                    )}
                    {article.readingTime && (
                      <span>{article.readingTime} min read</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: "var(--text-light)" }}
                    >
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p style={{ color: "var(--text-light)" }}>
            No articles found for this category.
          </p>
        </div>
      )}
    </>
  );
}
