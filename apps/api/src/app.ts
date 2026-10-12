import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { sql } from "drizzle-orm";
import type { Db } from "./db/client.js";
import { errorHandler, notFound, asyncHandler } from "./lib/errors.js";
import { requireAdmin } from "./middleware/auth.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { publicRouter } from "./routes/public.js";
import type { Mailer } from "./services/email.js";

export interface AppDeps {
  db: Db;
  mailer: Mailer;
  corsOrigins: string[];
  jwtSecret: string;
  adminEmail: string;
  adminPasswordHash: string;
  contactLimit?: number;
  loginLimit?: number;
  logging?: boolean;
}

// Builds the Express app from its dependencies. Tests pass an in-memory database and a fake mailer.
export function createApp(deps: AppDeps) {
  const app = express();

  // On Vercel one proxy sits in front and sets X-Forwarded-For; needed for correct client IPs in rate limiting.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(cors({ origin: deps.corsOrigins, methods: ["GET", "POST", "PATCH", "DELETE"] }));
  app.use(express.json({ limit: "20kb" }));
  if (deps.logging !== false) {
    app.use(pinoHttp({ redact: ["req.headers.authorization"] }));
  }

  // Health check for the hosting platform. Also confirms the database is reachable.
  app.get(
    "/health",
    asyncHandler(async (_req, res) => {
      await deps.db.execute(sql`select 1`);
      res.json({ status: "ok" });
    }),
  );

  app.use("/api", publicRouter(deps.db, deps.mailer, { contactLimit: deps.contactLimit ?? 5 }));
  app.use(
    "/api/auth",
    authRouter({
      adminEmail: deps.adminEmail,
      adminPasswordHash: deps.adminPasswordHash,
      jwtSecret: deps.jwtSecret,
      loginLimit: deps.loginLimit ?? 10,
    }),
  );
  app.use("/api/admin", requireAdmin(deps.jwtSecret), adminRouter(deps.db));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
