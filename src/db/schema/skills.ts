import {
  mysqlTable,
  int,
  varchar,
  text,
  tinyint,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const skillCategories = mysqlTable(
  "skill_categories",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    description: text("description"),
    color: varchar("color", { length: 20 }),
    sortOrder: int("sort_order").default(0),
    isActive: tinyint("is_active").default(1),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [index("idx_active").on(table.isActive)],
);

export const skills = mysqlTable(
  "skills",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    categoryId: int("category_id"),
    skillLevel: int("skill_level").default(50),
    proficiencyLevel: int("proficiency_level").default(50),
    description: text("description"),
    icon: varchar("icon", { length: 500 }),
    yearsExperience: int("years_experience"),
    color: varchar("color", { length: 20 }),
    isFeatured: tinyint("is_featured").default(0),
    isActive: tinyint("is_active").default(1),
    sortOrder: int("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [
    index("idx_category").on(table.categoryId),
    index("idx_featured").on(table.isFeatured),
    index("idx_active").on(table.isActive),
  ],
);

// Relations
export const skillCategoriesRelations = relations(
  skillCategories,
  ({ many }) => ({
    skills: many(skills),
  }),
);

export const skillsRelations = relations(skills, ({ one }) => ({
  category: one(skillCategories, {
    fields: [skills.categoryId],
    references: [skillCategories.id],
  }),
}));

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type SkillCategory = typeof skillCategories.$inferSelect;
export type NewSkillCategory = typeof skillCategories.$inferInsert;
