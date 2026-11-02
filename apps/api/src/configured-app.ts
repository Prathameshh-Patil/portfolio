import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createDb } from "./db/client.js";
import { createMailer } from "./integrations/email.js";

// The app wired to the real environment and database. Two entry points use it:
// server.ts (Docker, local) calls listen(); api/index.ts (Vercel) exports it as a function.
export const config = loadConfig();
export const { db, pool } = createDb(config.DATABASE_URL);

export const app = createApp({
  db,
  mailer: createMailer(config),
  corsOrigins: config.CORS_ORIGINS.split(",").map((s) => s.trim()),
  jwtSecret: config.JWT_SECRET,
  adminEmail: config.ADMIN_EMAIL,
  adminPasswordHash: config.ADMIN_PASSWORD_HASH,
});
