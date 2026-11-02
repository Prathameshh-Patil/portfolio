import { Router } from "express";
import rateLimit from "express-rate-limit";
import { loginSchema } from "@portfolio/contracts";
import { asyncHandler } from "../../core/errors.js";
import type { AuthService } from "./auth.service.js";

// Mounted at /api/auth.
export function authRoutes(service: AuthService, opts: { loginLimit: number }) {
  const router = Router();

  // Slows down password guessing: max N attempts per IP per 15 minutes.
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: opts.loginLimit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many login attempts, try again later" },
  });

  // POST /api/auth/login -> { token }
  router.post(
    "/login",
    loginLimiter,
    asyncHandler(async (req, res) => {
      res.json(await service.login(loginSchema.parse(req.body)));
    }),
  );

  return router;
}
