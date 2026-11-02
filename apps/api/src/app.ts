import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pino } from "pino";
import { pinoHttp } from "pino-http";
import type { Db } from "./db/client.js";
import { requireAdmin } from "./core/auth.js";
import { errorHandler, notFound } from "./core/errors.js";
import { requestId } from "./core/request-id.js";
import type { Mailer } from "./integrations/email.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { createAuthService } from "./modules/auth/auth.service.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";
import { docsRoutes } from "./modules/docs/docs.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { createMessagesRepository } from "./modules/messages/messages.repository.js";
import { adminMessageRoutes, contactRoutes } from "./modules/messages/messages.routes.js";
import { createMessagesService } from "./modules/messages/messages.service.js";
import { createProjectsRepository } from "./modules/projects/projects.repository.js";
import { adminProjectRoutes, publicProjectRoutes } from "./modules/projects/projects.routes.js";
import { createProjectsService } from "./modules/projects/projects.service.js";

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

// The composition root: the only place that knows every module. It builds each repository and
// service from its dependencies and mounts the routes. Tests pass their own database and a fake mailer.
export function createApp(deps: AppDeps) {
  const logger = pino({ enabled: deps.logging !== false, redact: ["req.headers.authorization"] });

  // ---- Modules: repository (SQL) -> service (rules) -> routes (HTTP) ----
  const projectsRepo = createProjectsRepository(deps.db);
  const messagesRepo = createMessagesRepository(deps.db);
  const projects = createProjectsService(projectsRepo);
  const messages = createMessagesService({ repo: messagesRepo, mailer: deps.mailer, logger });
  const auth = createAuthService({
    adminEmail: deps.adminEmail,
    adminPasswordHash: deps.adminPasswordHash,
    jwtSecret: deps.jwtSecret,
  });

  const app = express();

  // On Vercel and API Gateway one proxy sits in front and sets X-Forwarded-For; needed for correct
  // client IPs in rate limiting.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(cors({ origin: deps.corsOrigins, methods: ["GET", "POST", "PATCH", "DELETE"], exposedHeaders: ["X-Request-Id"] }));
  app.use(express.json({ limit: "20kb" }));
  // Every request gets an id (X-Request-Id) that appears in all of its log lines.
  app.use(pinoHttp({ logger, genReqId: requestId }));

  app.use(healthRoutes(deps.db));
  app.use(docsRoutes());

  app.use("/api/projects", publicProjectRoutes(projects));
  app.use("/api/contact", contactRoutes(messages, { limit: deps.contactLimit ?? 5 }));
  app.use("/api/auth", authRoutes(auth, { loginLimit: deps.loginLimit ?? 10 }));

  const admin = express.Router();
  admin.use(requireAdmin(deps.jwtSecret));
  admin.use("/stats", dashboardRoutes({ messages: messagesRepo, projects: projectsRepo }));
  admin.use("/messages", adminMessageRoutes(messages));
  admin.use("/projects", adminProjectRoutes(projects));
  app.use("/api/admin", admin);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
