import { Router } from "express";
import rateLimit from "express-rate-limit";
import { contactSchema, idParam, markReadSchema, pageQuery } from "@portfolio/contracts";
import { asyncHandler } from "../../core/errors.js";
import type { MessagesService } from "./messages.service.js";

// Mounted at /api/contact. Max N messages per IP per hour.
export function contactRoutes(service: MessagesService, opts: { limit: number }) {
  const router = Router();

  const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: opts.limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many messages, please try again later" },
  });

  router.post(
    "/",
    limiter,
    asyncHandler(async (req, res) => {
      res.status(201).json(await service.submitContact(contactSchema.parse(req.body)));
    }),
  );

  return router;
}

// Mounted at /api/admin/messages, behind requireAdmin.
export function adminMessageRoutes(service: MessagesService) {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      res.json(await service.inbox(pageQuery.parse(req.query)));
    }),
  );

  router.patch(
    "/:id",
    asyncHandler(async (req, res) => {
      const { id } = idParam.parse(req.params);
      res.json(await service.markRead(id, markReadSchema.parse(req.body).isRead));
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
