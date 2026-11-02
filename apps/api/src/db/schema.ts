import { boolean, index, int, json, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

// Projects shown on the portfolio. Edited from the admin panel.
export const projects = mysqlTable(
  "projects",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    title: varchar("title", { length: 120 }).notNull(),
    summary: text("summary").notNull(),
    // MySQL has no array type: the list is stored as a JSON array.
    techStack: json("tech_stack").$type<string[]>().notNull().$defaultFn(() => []),
    repoUrl: varchar("repo_url", { length: 500 }),
    demoUrl: varchar("demo_url", { length: 500 }),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(true),
    sortOrder: int("sort_order").notNull().default(0),
    views: int("views").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    // MySQL keeps this current on every UPDATE, so the routes never set it.
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => [
    // Matches the public list: WHERE published ORDER BY featured DESC, sort_order, created_at DESC.
    index("projects_public_list_idx").on(t.published, t.featured, t.sortOrder, t.createdAt),
  ],
);

// Messages sent through the contact form.
export const messages = mysqlTable(
  "messages",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    subject: varchar("subject", { length: 150 }),
    body: text("body").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    // The admin inbox: newest first, optionally only unread. Also answers the unread count.
    index("messages_inbox_idx").on(t.isRead, t.createdAt, t.id),
    // The unfiltered inbox (all messages, newest first).
    index("messages_created_idx").on(t.createdAt, t.id),
  ],
);

export type Project = typeof projects.$inferSelect;
export type Message = typeof messages.$inferSelect;
