import { beforeEach, describe, expect, it } from "vitest";
import { ConflictError, NotFoundError, BadRequestError } from "../../src/core/errors.js";
import { DuplicateKeyError } from "../../src/db/errors.js";
import type { ProjectRow, ProjectsRepository } from "../../src/modules/projects/projects.repository.js";
import { createProjectsService } from "../../src/modules/projects/projects.service.js";

// The service only depends on the ProjectsRepository interface, so these tests swap in an in-memory
// version: no database, milliseconds per test. The MySQL repository is covered by tests/integration.
function fakeRepository(): ProjectsRepository {
  const rows: ProjectRow[] = [];
  let nextId = 1;
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    listPublished: async () => rows.filter((r) => r.published),
    listAll: async () => [...rows],
    findPublishedBySlug: async (slug) => rows.find((r) => r.slug === slug && r.published),
    findById: async (id) => rows.find((r) => r.id === id),
    incrementViews: async (slug) => {
      const row = rows.find((r) => r.slug === slug && r.published);
      return row ? ++row.views : undefined;
    },
    create: async (data) => {
      if (rows.some((r) => r.slug === data.slug)) throw new DuplicateKeyError();
      const row: ProjectRow = {
        id: nextId++, techStack: [], repoUrl: null, demoUrl: null, featured: false, published: true,
        sortOrder: 0, views: 0, createdAt: now, updatedAt: now, ...data,
      };
      rows.push(row);
      return row;
    },
    update: async (id, data) => {
      const row = rows.find((r) => r.id === id);
      if (!row) return undefined;
      if (data.slug && rows.some((r) => r.slug === data.slug && r.id !== id)) throw new DuplicateKeyError();
      return Object.assign(row, data);
    },
    remove: async (id) => {
      const i = rows.findIndex((r) => r.id === id);
      return i >= 0 && rows.splice(i, 1).length === 1;
    },
    mostViewed: async (limit) => [...rows].sort((a, b) => b.views - a.views).slice(0, limit),
  };
}

const input = { slug: "slotwise", title: "Slotwise", summary: "Booking", techStack: [], featured: false, published: true, sortOrder: 0 };

describe("projects service", () => {
  let service: ReturnType<typeof createProjectsService>;
  beforeEach(() => {
    service = createProjectsService(fakeRepository());
  });

  it("turns a duplicate slug into a 409 ConflictError", async () => {
    await service.create(input);
    await expect(service.create(input)).rejects.toBeInstanceOf(ConflictError);
  });

  it("hides unpublished projects from the public read and the view counter", async () => {
    await service.create({ ...input, published: false });
    await expect(service.getPublished("slotwise")).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.recordView("slotwise")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("returns the new view count", async () => {
    await service.create(input);
    await service.recordView("slotwise");
    expect(await service.recordView("slotwise")).toEqual({ views: 2 });
  });

  it("rejects an empty update before touching the database", async () => {
    const { id } = await service.create(input);
    await expect(service.update(id, {})).rejects.toBeInstanceOf(BadRequestError);
  });

  it("404s when updating or deleting a project that doesn't exist", async () => {
    await expect(service.update(99, { title: "x" })).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.remove(99)).rejects.toBeInstanceOf(NotFoundError);
  });
});
