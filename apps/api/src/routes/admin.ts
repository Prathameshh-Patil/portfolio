import { Router } from "express";
import { asc, count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "../db/client.js";
import { messages, projects, publicationStatus, publications } from "../db/schema.js";
import { asyncHandler, HttpError } from "../lib/errors.js";

const idParam = z.object({ id: z.coerce.number().int().positive() });

// Fields without defaults: used for PATCH, so only the fields that were sent get changed.
const projectFields = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,80}$/, "lowercase letters, numbers and dashes only"),
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(2000),
  techStack: z.array(z.string().trim().min(1).max(40)).max(20),
  repoUrl: z.url().nullable().optional(),
  demoUrl: z.url().nullable().optional(),
  featured: z.boolean(),
  published: z.boolean(),
  sortOrder: z.number().int(),
});

// For POST: the optional fields get sensible defaults.
const createProjectSchema = projectFields.extend({
  techStack: projectFields.shape.techStack.default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
const updateProjectSchema = projectFields.partial();

// Same pattern as projects: required fields for PATCH-able data, defaults only on create.
const publicationFields = z.object({
  title: z.string().trim().min(1).max(300),
  authors: z.string().trim().min(1).max(1000),
  venue: z.string().trim().max(200).nullable().optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  status: z.enum(publicationStatus.enumValues),
  url: z.url().nullable().optional(),
  summary: z.string().trim().min(1).max(2000),
  visible: z.boolean(),
  sortOrder: z.number().int(),
});
const createPublicationSchema = publicationFields.extend({
  visible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
const updatePublicationSchema = publicationFields.partial();

const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unread: z.enum(["true", "false"]).optional(),
});

// Postgres error code for a unique constraint violation (duplicate slug).
const isUniqueViolation = (err: unknown) => {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
};

// Every route here is behind requireAdmin (see app.ts).
export function adminRouter(db: Db) {
  const router = Router();

  // ---- Dashboard summary ----
  router.get(
    "/stats",
    asyncHandler(async (_req, res) => {
      const [[msgs], [unread], topProjects] = await Promise.all([
        db.select({ total: count() }).from(messages),
        db.select({ total: count() }).from(messages).where(eq(messages.isRead, false)),
        db
          .select({ slug: projects.slug, title: projects.title, views: projects.views })
          .from(projects)
          .orderBy(desc(projects.views))
          .limit(5),
      ]);
      res.json({ messages: msgs.total, unreadMessages: unread.total, topProjects });
    }),
  );

  // ---- Messages ----
  router.get(
    "/messages",
    asyncHandler(async (req, res) => {
      const { page, limit, unread } = pageQuery.parse(req.query);
      const where = unread === undefined ? undefined : eq(messages.isRead, unread === "false");
      const [rows, [{ total }]] = await Promise.all([
        db
          .select()
          .from(messages)
          .where(where)
          .orderBy(desc(messages.createdAt), desc(messages.id))
          .limit(limit)
          .offset((page - 1) * limit),
        db.select({ total: count() }).from(messages).where(where),
      ]);
      res.json({ data: rows, page, limit, total });
    }),
  );

  router.patch(
    "/messages/:id",
    asyncHandler(async (req, res) => {
      const { id } = idParam.parse(req.params);
      const { isRead } = z.object({ isRead: z.boolean() }).parse(req.body);
      const [row] = await db.update(messages).set({ isRead }).where(eq(messages.id, id)).returning();
      if (!row) throw new HttpError(404, "Message not found");
      res.json(row);
    }),
  );

  router.delete(
    "/messages/:id",
    asyncHandler(async (req, res) => {
      const { id } = idParam.parse(req.params);
      const [row] = await db.delete(messages).where(eq(messages.id, id)).returning({ id: messages.id });
      if (!row) throw new HttpError(404, "Message not found");
      res.status(204).end();
    }),
  );

  // ---- Projects (including unpublished drafts) ----
  router.get(
    "/projects",
    asyncHandler(async (_req, res) => {
      res.json(await db.select().from(projects).orderBy(asc(projects.sortOrder), asc(projects.id)));
    }),
  );

  router.post(
    "/projects",
    asyncHandler(async (req, res) => {
      const data = createProjectSchema.parse(req.body);
      try {
        const [row] = await db.insert(projects).values(data).returning();
        res.status(201).json(row);
      } catch (err) {
        if (isUniqueViolation(err)) throw new HttpError(409, "A project with this slug already exists");
        throw err;
      }
    }),
  );

  router.patch(
    "/projects/:id",
    asyncHandler(async (req, res) => {
      const { id } = idParam.parse(req.params);
      const data = updateProjectSchema.parse(req.body);
      if (Object.keys(data).length === 0) throw new HttpError(400, "Nothing to update");
      try {
        const [row] = await db
          .update(projects)
          .set({ ...data, updatedAt: sql`now()` })
          .where(eq(projects.id, id))
          .returning();
        if (!row) throw new HttpError(404, "Project not found");
        res.json(row);
      } catch (err) {
        if (isUniqueViolation(err)) throw new HttpError(409, "A project with this slug already exists");
        throw err;
      }
    }),
  );

  router.delete(
    "/projects/:id",
    asyncHandler(async (req, res) => {
      const { id } = idParam.parse(req.params);
      const [row] = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
      if (!row) throw new HttpError(404, "Project not found");
      res.status(204).end();
    }),
  );

  // ---- Publications (including hidden ones) ----
  router.get(
    "/publications",
    asyncHandler(async (_req, res) => {
      res.json(await db.select().from(publications).orderBy(asc(publications.sortOrder), asc(publications.id)));
    }),
  );

  router.post(
    "/publications",
    asyncHandler(async (req, res) => {
      const data = createPublicationSchema.parse(req.body);
      const [row] = await db.insert(publications).values(data).returning();
      res.status(201).json(row);
    }),
  );

  router.patch(
    "/publications/:id",
    asyncHandler(async (req, res) => {
      const { id } = idParam.parse(req.params);
      const data = updatePublicationSchema.parse(req.body);
      if (Object.keys(data).length === 0) throw new HttpError(400, "Nothing to update");
      const [row] = await db
        .update(publications)
        .set({ ...data, updatedAt: sql`now()` })
        .where(eq(publications.id, id))
        .returning();
      if (!row) throw new HttpError(404, "Publication not found");
      res.json(row);
    }),
  );

  router.delete(
    "/publications/:id",
    asyncHandler(async (req, res) => {
      const { id } = idParam.parse(req.params);
      const [row] = await db.delete(publications).where(eq(publications.id, id)).returning({ id: publications.id });
      if (!row) throw new HttpError(404, "Publication not found");
      res.status(204).end();
    }),
  );

  return router;
}
