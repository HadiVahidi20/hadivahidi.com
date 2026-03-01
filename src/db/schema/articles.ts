import {
  mysqlTable,
  int,
  varchar,
  text,
  longtext,
  tinyint,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const articleCategories = mysqlTable(
  "article_categories",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    color: varchar("color", { length: 20 }),
    description: text("description"),
    sortOrder: int("sort_order").default(0),
    isActive: tinyint("is_active").default(1),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [index("idx_active").on(table.isActive)],
);

export const articles = mysqlTable(
  "articles",
  {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    excerpt: text("excerpt"),
    content: longtext("content"),
    featuredImage: varchar("featured_image", { length: 500 }),
    status: varchar("status", { length: 50 }).default("draft"),
    isFeatured: tinyint("is_featured").default(0),
    authorId: int("author_id"),
    categoryId: int("category_id"),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    readingTime: int("reading_time"),
    viewCount: int("view_count").default(0),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [
    index("idx_status").on(table.status),
    index("idx_featured").on(table.isFeatured),
    index("idx_author").on(table.authorId),
    index("idx_category").on(table.categoryId),
    index("idx_slug").on(table.slug),
  ],
);

export const articleTags = mysqlTable(
  "article_tags",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    color: varchar("color", { length: 20 }),
    usageCount: int("usage_count").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [index("idx_usage").on(table.usageCount)],
);

export const articleTagRelationships = mysqlTable(
  "article_tag_relationships",
  {
    id: int("id").primaryKey().autoincrement(),
    articleId: int("article_id").notNull(),
    tagId: int("tag_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_article_tag").on(table.articleId, table.tagId),
    index("idx_tag").on(table.tagId),
  ],
);

// Relations
export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  category: one(articleCategories, {
    fields: [articles.categoryId],
    references: [articleCategories.id],
  }),
  tagRelationships: many(articleTagRelationships),
}));

export const articleCategoriesRelations = relations(
  articleCategories,
  ({ many }) => ({
    articles: many(articles),
  }),
);

export const articleTagRelationshipsRelations = relations(
  articleTagRelationships,
  ({ one }) => ({
    article: one(articles, {
      fields: [articleTagRelationships.articleId],
      references: [articles.id],
    }),
    tag: one(articleTags, {
      fields: [articleTagRelationships.tagId],
      references: [articleTags.id],
    }),
  }),
);

export const articleTagsRelations = relations(articleTags, ({ many }) => ({
  articleRelationships: many(articleTagRelationships),
}));

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type ArticleCategory = typeof articleCategories.$inferSelect;
export type ArticleTag = typeof articleTags.$inferSelect;
