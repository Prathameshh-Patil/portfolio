import { Router } from "express";
import { asc, count, desc, eq } from "drizzle-orm";
import type { Db } from "../db/client.js";
import { messages, projects } from "../db/schema.js";
import { asyncHandler, HttpError } from "../lib/errors.js";
import { createProjectSchema, idParam, markReadSchema, pageQuery, updateProjectSchema } from "../schemas.js";

// MySQL error for a unique key violation (duplicate slug). Drizzle may wrap the driver error in `cause`.
const isUniqueViolation = (err: unknown) => {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "ER_DUP_ENTRY" || e?.cause?.code === "ER_DUP_ENTRY";
};

// MySQL has no RETURNING: writes report how many rows matched, then the row is read back.
type WriteResult = [{ affectedRows: number }, unknown];

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
      const { isRead } = markReadSchema.parse(req.body);
      const [{ affectedRows }]: WriteResult = await db.update(messages).set({ isRead }).where(eq(messages.id, id));
      if (affectedRows === 0) throw new HttpError(404, "Message not found");
      const [row] = await db.select().from(messages).where(eq(messages.id, id));
      res.json(row);
    }),
  );

  router.delete(
    "/messages/:id",
    asyncHandler(async (req, res) => {
      const { id } = idParam.parse(req.params);
      const [{ affectedRows }]: WriteResult = await db.delete(messages).where(eq(messages.id, id));
      if (affectedRows === 0) throw new HttpError(404, "Message not found");
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
        const [{ id }] = await db.insert(projects).values(data).$returningId();
        const [row] = await db.select().from(projects).where(eq(projects.id, id));
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
        // updated_at is refreshed by MySQL (ON UPDATE CURRENT_TIMESTAMP).
        const [{ affectedRows }]: WriteResult = await db.update(projects).set(data).where(eq(projects.id, id));
        if (affectedRows === 0) throw new HttpError(404, "Project not found");
        const [row] = await db.select().from(projects).where(eq(projects.id, id));
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
      const [{ affectedRows }]: WriteResult = await db.delete(projects).where(eq(projects.id, id));
      if (affectedRows === 0) throw new HttpError(404, "Project not found");
      res.status(204).end();
    }),
  );

  return router;
}
