import {
  mysqlTable,
  int,
  varchar,
  text,
  longtext,
  tinyint,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const projects = mysqlTable(
  "projects",
  {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    subtitle: varchar("subtitle", { length: 255 }),
    description: longtext("description"),
    shortDescription: text("short_description"),
    thumbnail: varchar("thumbnail", { length: 500 }),
    technologies: text("technologies"),
    size: varchar("size", { length: 50 }),
    status: varchar("status", { length: 50 }).default("draft"),
    positionTop: varchar("position_top", { length: 20 }),
    positionLeft: varchar("position_left", { length: 20 }),
    sortOrder: int("sort_order").default(0),
    isFeatured: tinyint("is_featured").default(0),
    isActive: tinyint("is_active").default(1),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [
    index("idx_status").on(table.status),
    index("idx_featured").on(table.isFeatured),
    index("idx_active").on(table.isActive),
  ],
);

export const projectImages = mysqlTable(
  "project_images",
  {
    id: int("id").primaryKey().autoincrement(),
    projectId: int("project_id").notNull(),
    imagePath: varchar("image_path", { length: 500 }).notNull(),
    altText: varchar("alt_text", { length: 500 }),
    caption: text("caption"),
    sortOrder: int("sort_order").default(0),
    isActive: tinyint("is_active").default(1),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [index("idx_project").on(table.projectId)],
);

export const projectLinks = mysqlTable(
  "project_links",
  {
    id: int("id").primaryKey().autoincrement(),
    projectId: int("project_id").notNull(),
    linkType: varchar("link_type", { length: 50 }),
    url: varchar("url", { length: 500 }).notNull(),
    title: varchar("title", { length: 255 }),
    sortOrder: int("sort_order").default(0),
    isActive: tinyint("is_active").default(1),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [index("idx_project").on(table.projectId)],
);

export const projectHighlights = mysqlTable(
  "project_highlights",
  {
    id: int("id").primaryKey().autoincrement(),
    projectId: int("project_id").notNull(),
    highlightText: text("highlight_text").notNull(),
    sortOrder: int("sort_order").default(0),
    isActive: tinyint("is_active").default(1),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [index("idx_project").on(table.projectId)],
);

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  images: many(projectImages),
  links: many(projectLinks),
  highlights: many(projectHighlights),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));

export const projectLinksRelations = relations(projectLinks, ({ one }) => ({
  project: one(projects, {
    fields: [projectLinks.projectId],
    references: [projects.id],
  }),
}));

export const projectHighlightsRelations = relations(
  projectHighlights,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectHighlights.projectId],
      references: [projects.id],
    }),
  }),
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectImage = typeof projectImages.$inferSelect;
export type ProjectLink = typeof projectLinks.$inferSelect;
export type ProjectHighlight = typeof projectHighlights.$inferSelect;
