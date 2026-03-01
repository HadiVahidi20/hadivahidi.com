"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  category: { name: string; color: string | null } | null;
  publishedAt: string | null;
  readingTime: number | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

function ArticleCard({ article, index }: { article: Article; index: number }) {
  return (
    <motion.article
      className="group rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "var(--bg-alt)",
        border: "1px solid var(--border-color)",
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -4 }}
    >
      {/* Featured image */}
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
            style={{ backgroundColor: "rgba(var(--accent-rgb), 0.05)" }}
          >
            <span className="text-4xl">📝</span>
          </div>
        )}
        {/* Category badge */}
        {article.category && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full text-white"
            style={{
              backgroundColor: article.category.color || "var(--accent)",
            }}
          >
            {article.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "var(--muted)" }}>
          {article.publishedAt && (
            <time>
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          )}
          {article.readingTime && <span>{article.readingTime} min read</span>}
        </div>
        <Link href={`/articles/${article.slug}`}>
          <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
            {article.title}
          </h3>
        </Link>
        {article.excerpt && (
          <p
            className="text-sm line-clamp-2"
            style={{ color: "var(--text-light)" }}
          >
            {article.excerpt}
          </p>
        )}
      </div>
    </motion.article>
  );
}

export default function Articles({
  articles,
}: {
  articles?: Article[] | null;
}) {
  const data = articles || [];

  return (
    <section id="articles" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--font-display)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
        >
          Latest Articles
        </motion.h2>
        <motion.div
          className="w-16 h-1 rounded-full mb-12"
          style={{ backgroundColor: "var(--accent)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((article, i) => (
            <ArticleCard key={article.id} article={article} index={i + 2} />
          ))}
        </div>

        {data.length === 0 && (
          <div
            className="text-center py-16 rounded-2xl"
            style={{
              backgroundColor: "var(--bg-alt)",
              border: "1px solid var(--border-color)",
            }}
          >
            <p style={{ color: "var(--text-light)" }}>
              Articles will appear here once published.
            </p>
          </div>
        )}

        {data.length > 0 && (
          <motion.div
            className="text-center mt-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={5}
          >
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{
                border: "1px solid var(--border-color)",
                color: "var(--text)",
              }}
            >
              View All Articles &rarr;
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
