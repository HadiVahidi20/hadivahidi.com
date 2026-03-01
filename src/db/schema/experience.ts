import {
  mysqlTable,
  int,
  varchar,
  text,
  longtext,
  date,
  tinyint,
  json,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";

export const experienceItems = mysqlTable(
  "experience_items",
  {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    company: varchar("company", { length: 255 }).notNull(),
    location: varchar("location", { length: 255 }),
    position: varchar("position", { length: 255 }).notNull(),
    employmentType: varchar("employment_type", { length: 50 }).default(
      "full-time",
    ),
    description: longtext("description"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    isCurrent: tinyint("is_current").default(0),
    technologies: json("technologies").$type<string[]>(),
    achievements: json("achievements").$type<string[]>(),
    companyLogo: varchar("company_logo", { length: 500 }),
    companyWebsite: varchar("company_website", { length: 500 }),
    isFeatured: tinyint("is_featured").default(0),
    isActive: tinyint("is_active").default(1),
    sortOrder: int("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [
    index("idx_current").on(table.isCurrent),
    index("idx_featured").on(table.isFeatured),
    index("idx_active").on(table.isActive),
  ],
);

export type ExperienceItem = typeof experienceItems.$inferSelect;
export type NewExperienceItem = typeof experienceItems.$inferInsert;
