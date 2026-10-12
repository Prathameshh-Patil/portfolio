import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import bcrypt from "bcryptjs";
import request from "supertest";
import { createApp } from "../src/app.js";
import type { Db } from "../src/db/client.js";
import * as schema from "../src/db/schema.js";
import type { Mailer } from "../src/services/email.js";

export const ADMIN_EMAIL = "admin@example.com";
export const ADMIN_PASSWORD = "correct-horse-battery";
const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 4); // low cost: fast tests

// Each test file gets a fresh in-memory Postgres with the real migrations applied.
export async function setup(overrides: { contactLimit?: number; loginLimit?: number } = {}) {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });

  const sent: Parameters<Mailer["notifyNewMessage"]>[0][] = [];
  const mailer: Mailer = { async notifyNewMessage(m) { sent.push(m); } };

  const app = createApp({
    db: db as unknown as Db,
    mailer,
    corsOrigins: ["http://localhost:3000"],
    jwtSecret: "test-secret-that-is-at-least-32-characters-long",
    adminEmail: ADMIN_EMAIL,
    adminPasswordHash: passwordHash,
    contactLimit: overrides.contactLimit ?? 100,
    loginLimit: overrides.loginLimit ?? 100,
    logging: false,
  });

  async function adminToken() {
    const res = await request(app).post("/api/auth/login").send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    return res.body.token as string;
  }

  return { app, db, client, sent, adminToken };
}
