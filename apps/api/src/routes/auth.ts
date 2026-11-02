import { Router } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { asyncHandler, HttpError } from "../lib/errors.js";
import { signAdminToken } from "../middleware/auth.js";
import { loginSchema } from "../schemas.js";

export function authRouter(opts: { adminEmail: string; adminPasswordHash: string; jwtSecret: string; loginLimit: number }) {
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
      const { email, password } = loginSchema.parse(req.body);
      // Always run bcrypt, even for a wrong email, so response time doesn't reveal which part was wrong.
      const passwordOk = await bcrypt.compare(password, opts.adminPasswordHash);
      const emailOk = email.toLowerCase() === opts.adminEmail.toLowerCase();
      if (!passwordOk || !emailOk) throw new HttpError(401, "Invalid email or password");
      res.json({ token: signAdminToken(opts.adminEmail, opts.jwtSecret) });
    }),
  );

  return router;
}
