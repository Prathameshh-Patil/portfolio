import { Router } from "express";
import { asyncHandler } from "../../core/errors.js";
import type { MessagesRepository } from "../messages/messages.repository.js";
import type { ProjectsRepository } from "../projects/projects.repository.js";

// Mounted at /api/admin/stats, behind requireAdmin. Reads from two modules, so it lives in neither.
export function dashboardRoutes(deps: { messages: MessagesRepository; projects: ProjectsRepository }) {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      // Independent queries run in parallel.
      const [counts, topProjects] = await Promise.all([deps.messages.counts(), deps.projects.mostViewed(5)]);
      res.json({ messages: counts.total, unreadMessages: counts.unread, topProjects });
    }),
  );

  return router;
}
