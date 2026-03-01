import {
  mysqlTable,
  int,
  varchar,
  text,
  longtext,
  tinyint,
  json,
  timestamp,
} from "drizzle-orm/mysql-core";

export const profileData = mysqlTable("profile_data", {
  id: int("id").primaryKey().autoincrement(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  professionalTitle: varchar("professional_title", { length: 255 }),
  location: varchar("location", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 500 }),
  bio: text("bio"),
  about: text("about"),
  profileImage: varchar("profile_image", { length: 500 }),
  socialLinks: json("social_links").$type<Record<string, string>>(),
  skillsHighlights: json("skills_highlights").$type<string[]>(),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  isAvailable: tinyint("is_available").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const settings = mysqlTable("settings", {
  id: int("id").primaryKey().autoincrement(),
  settingKey: varchar("setting_key", { length: 255 }).unique().notNull(),
  settingValue: longtext("setting_value"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const mediaFolders = mysqlTable("media_folders", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  parentId: int("parent_id"),
  description: text("description"),
  sortOrder: int("sort_order").default(0),
  isActive: tinyint("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const mediaFiles = mysqlTable("media_files", {
  id: int("id").primaryKey().autoincrement(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  fileSize: int("file_size").notNull(),
  folderId: int("folder_id"),
  altText: varchar("alt_text", { length: 500 }),
  description: text("description"),
  usageCount: int("usage_count").default(0),
  isActive: tinyint("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type ProfileData = typeof profileData.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type MediaFile = typeof mediaFiles.$inferSelect;
export type MediaFolder = typeof mediaFolders.$inferSelect;
