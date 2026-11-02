import { Router } from "express";
import { createProjectSchema, idParam, slugParam, updateProjectSchema } from "@portfolio/contracts";
import { asyncHandler } from "../../core/errors.js";
import type { ProjectsService } from "./projects.service.js";

// HTTP only: parse the request with the contract schema, call the service, pick the status code.

// Mounted at /api/projects. Used by the website, no login.
export function publicProjectRoutes(service: ProjectsService) {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      res.json(await service.listPublished());
    }),
  );

  router.get(
    "/:slug",
    asyncHandler(async (req, res) => {
      res.json(await service.getPublished(slugParam.parse(req.params).slug));
    }),
  );

  router.post(
    "/:slug/view",
    asyncHandler(async (req, res) => {
      res.json(await service.recordView(slugParam.parse(req.params).slug));
    }),
  );

  return router;
}

// Mounted at /api/admin/projects, behind requireAdmin. Includes unpublished drafts.
export function adminProjectRoutes(service: ProjectsService) {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      res.json(await service.listAll());
    }),
  );

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      res.status(201).json(await service.create(createProjectSchema.parse(req.body)));
    }),
  );

  router.patch(
    "/:id",
    asyncHandler(async (req, res) => {
      const { id } = idParam.parse(req.params);
      res.json(await service.update(id, updateProjectSchema.parse(req.body)));
    }),
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      await service.remove(idParam.parse(req.params).id);
      res.status(204).end();
    }),
  );

  return router;
}
