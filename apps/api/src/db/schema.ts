import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// Projects shown on the portfolio. Edited from the admin panel.
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  title: varchar("title", { length: 120 }).notNull(),
  summary: text("summary").notNull(),
  techStack: text("tech_stack").array().notNull().default([]),
  repoUrl: text("repo_url"),
  demoUrl: text("demo_url"),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Messages sent through the contact form.
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  subject: varchar("subject", { length: 150 }),
  body: text("body").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Research papers. "status" is where the paper is in the publishing process;
// "visible" is whether it is shown on the site (named differently so the two aren't confused).
export const publicationStatus = pgEnum("publication_status", ["published", "accepted", "under_review", "preprint"]);

export const publications = pgTable("publications", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  authors: text("authors").notNull(),
  venue: varchar("venue", { length: 200 }),
  year: integer("year"),
  status: publicationStatus("status").notNull(),
  url: text("url"),
  summary: text("summary").notNull(),
  visible: boolean("visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Publication = typeof publications.$inferSelect;
