import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { Db } from "../../db/client.js";
import { DuplicateKeyError, isDuplicateKey } from "../../db/errors.js";
import { projects } from "../../db/schema.js";

export type ProjectRow = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// Every SQL query about projects, and nothing else. The service above it never sees Drizzle or MySQL,
// so it can be tested with an in-memory fake (tests/projects.service.test.ts).
export interface ProjectsRepository {
  listPublished(): Promise<ProjectRow[]>;
  listAll(): Promise<ProjectRow[]>;
  findPublishedBySlug(slug: string): Promise<ProjectRow | undefined>;
  findById(id: number): Promise<ProjectRow | undefined>;
  /** Adds one view and returns the new count, or undefined if there is no such published project. */
  incrementViews(slug: string): Promise<number | undefined>;
  /** @throws DuplicateKeyError if the slug is taken */
  create(data: NewProject): Promise<ProjectRow>;
  /** @returns undefined if there is no such project. @throws DuplicateKeyError if the new slug is taken */
  update(id: number, data: Partial<NewProject>): Promise<ProjectRow | undefined>;
  /** @returns false if there was no such project */
  remove(id: number): Promise<boolean>;
  mostViewed(limit: number): Promise<Pick<ProjectRow, "slug" | "title" | "views">[]>;
}

// MySQL has no RETURNING: writes report how many rows matched, then the row is read back.
type WriteResult = [{ affectedRows: number }, unknown];

const translateDuplicate = (err: unknown): never => {
  throw isDuplicateKey(err) ? new DuplicateKeyError("Duplicate slug", { cause: err }) : err;
};

export function createProjectsRepository(db: Db): ProjectsRepository {
  const published = (slug: string) => and(eq(projects.slug, slug), eq(projects.published, true));
  const findById = async (id: number) => (await db.select().from(projects).where(eq(projects.id, id)))[0];

  return {
    listPublished: () =>
      // Served by projects_public_list_idx (published, featured, sort_order, created_at).
      db
        .select()
        .from(projects)
        .where(eq(projects.published, true))
        .orderBy(desc(projects.featured), asc(projects.sortOrder), desc(projects.createdAt)),

    listAll: () => db.select().from(projects).orderBy(asc(projects.sortOrder), asc(projects.id)),

    findPublishedBySlug: async (slug) => (await db.select().from(projects).where(published(slug)))[0],

    findById,

    // UPDATE ... SET views = views + 1 is atomic, so concurrent visits are never lost. The UPDATE locks the
    // row until the transaction commits, so the SELECT after it reads exactly this visit's count.
    incrementViews: (slug) =>
      db.transaction(async (tx) => {
        await tx.update(projects).set({ views: sql`${projects.views} + 1` }).where(published(slug));
        const [row] = await tx.select({ views: projects.views }).from(projects).where(published(slug));
        return row?.views;
      }),

    create: async (data) => {
      const [{ id }] = await db.insert(projects).values(data).$returningId().catch(translateDuplicate);
      return (await findById(id))!;
    },

    update: async (id, data) => {
      // updated_at is refreshed by MySQL (ON UPDATE CURRENT_TIMESTAMP).
      const [{ affectedRows }]: WriteResult = await db
        .update(projects)
        .set(data)
        .where(eq(projects.id, id))
        .catch(translateDuplicate);
      return affectedRows === 0 ? undefined : findById(id);
    },

    remove: async (id) => {
      const [{ affectedRows }]: WriteResult = await db.delete(projects).where(eq(projects.id, id));
      return affectedRows > 0;
    },

    mostViewed: (limit) =>
      db
        .select({ slug: projects.slug, title: projects.title, views: projects.views })
        .from(projects)
        .orderBy(desc(projects.views))
        .limit(limit),
  };
}
