import { Router } from "express";
import rateLimit from "express-rate-limit";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { Db } from "../db/client.js";
import { messages, projects } from "../db/schema.js";
import { asyncHandler, HttpError } from "../lib/errors.js";
import { contactSchema, slugParam } from "../schemas.js";
import type { Mailer } from "../services/email.js";

export function publicRouter(db: Db, mailer: Mailer, opts: { contactLimit: number }) {
  const router = Router();

  // GET /api/projects : published projects, featured first
  router.get(
    "/projects",
    asyncHandler(async (_req, res) => {
      const rows = await db
        .select()
        .from(projects)
        .where(eq(projects.published, true))
        .orderBy(desc(projects.featured), asc(projects.sortOrder), desc(projects.createdAt));
      res.json(rows);
    }),
  );

  // GET /api/projects/:slug
  router.get(
    "/projects/:slug",
    asyncHandler(async (req, res) => {
      const { slug } = slugParam.parse(req.params);
      const [row] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.slug, slug), eq(projects.published, true)));
      if (!row) throw new HttpError(404, "Project not found");
      res.json(row);
    }),
  );

  // POST /api/projects/:slug/view : increments the view counter.
  // UPDATE ... SET views = views + 1 is atomic, so concurrent visits are never lost. The UPDATE locks the
  // row until the transaction commits, so the SELECT after it reads exactly this visit's count.
  router.post(
    "/projects/:slug/view",
    asyncHandler(async (req, res) => {
      const { slug } = slugParam.parse(req.params);
      const where = and(eq(projects.slug, slug), eq(projects.published, true));
      const row = await db.transaction(async (tx) => {
        await tx.update(projects).set({ views: sql`${projects.views} + 1` }).where(where);
        const [found] = await tx.select({ views: projects.views }).from(projects).where(where);
        return found;
      });
      if (!row) throw new HttpError(404, "Project not found");
      res.json(row);
    }),
  );

  // POST /api/contact : max N messages per IP per hour
  const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: opts.contactLimit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many messages, please try again later" },
  });

  router.post(
    "/contact",
    contactLimiter,
    asyncHandler(async (req, res) => {
      const { website, ...data } = contactSchema.parse(req.body);
      if (website) {
        // Pretend it worked so the bot doesn't learn anything.
        res.status(201).json({ ok: true });
        return;
      }
      const [saved] = await db.insert(messages).values(data).$returningId();
      // The message is already saved, so an email failure shouldn't fail the request.
      mailer.notifyNewMessage(data).catch((err) => req.log?.warn({ err }, "Email notification failed"));
      res.status(201).json({ ok: true, id: saved.id });
    }),
  );

  return router;
}
