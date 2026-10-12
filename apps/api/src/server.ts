import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createDb } from "./db/client.js";
import { createMailer } from "./services/email.js";

const config = loadConfig();
const { db, pool } = createDb(config.DATABASE_URL);

const app = createApp({
  db,
  mailer: createMailer(config),
  corsOrigins: config.CORS_ORIGINS.split(",").map((s) => s.trim()),
  jwtSecret: config.JWT_SECRET,
  adminEmail: config.ADMIN_EMAIL,
  adminPasswordHash: config.ADMIN_PASSWORD_HASH,
});

const server = app.listen(config.PORT, () => {
  console.log(`API listening on http://localhost:${config.PORT}`);
});

// Finish in-flight requests and close DB connections when the platform stops the container.
function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
