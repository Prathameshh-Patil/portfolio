import type { CreateProject, UpdateProject } from "@portfolio/contracts";
import { BadRequestError, ConflictError, NotFoundError } from "../../core/errors.js";
import { DuplicateKeyError } from "../../db/errors.js";
import type { ProjectsRepository } from "./projects.repository.js";

// The rules about projects. No HTTP and no SQL here: routes call it, the repository stores the data.
export function createProjectsService(repo: ProjectsRepository) {
  const conflictOnDuplicate = (err: unknown): never => {
    throw err instanceof DuplicateKeyError ? new ConflictError("A project with this slug already exists") : err;
  };

  return {
    listPublished: () => repo.listPublished(),

    async getPublished(slug: string) {
      const project = await repo.findPublishedBySlug(slug);
      if (!project) throw new NotFoundError("Project not found");
      return project;
    },

    async recordView(slug: string) {
      const views = await repo.incrementViews(slug);
      if (views === undefined) throw new NotFoundError("Project not found");
      return { views };
    },

    listAll: () => repo.listAll(),

    // Input has already been validated (and defaults filled in) by the contract schema.
    create: (data: CreateProject) => repo.create(data).catch(conflictOnDuplicate),

    async update(id: number, data: UpdateProject) {
      if (Object.keys(data).length === 0) throw new BadRequestError("Nothing to update");
      const project = await repo.update(id, data).catch(conflictOnDuplicate);
      if (!project) throw new NotFoundError("Project not found");
      return project;
    },

    async remove(id: number) {
      if (!(await repo.remove(id))) throw new NotFoundError("Project not found");
    },
  };
}

export type ProjectsService = ReturnType<typeof createProjectsService>;
