import { randomBytes } from "node:crypto";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import request from "supertest";
import { createApp } from "../src/app.js";
import { createDb } from "../src/db/client.js";
import type { Mailer } from "../src/services/email.js";

// A MySQL server where the tests may create databases. Default: the compose `db` service as root.
const serverUrl = process.env.TEST_DATABASE_URL ?? "mysql://root:portfolio@localhost:3307";
const cleanups: (() => Promise<void>)[] = [];

export const ADMIN_EMAIL = "admin@example.com";
export const ADMIN_PASSWORD = "correct-horse-battery";
const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 4); // low cost: fast tests

// Each setup() gets a fresh, empty MySQL database with the real migrations applied.
export async function setup(overrides: { contactLimit?: number; loginLimit?: number } = {}) {
  const name = `portfolio_test_${randomBytes(4).toString("hex")}`;
  const admin = await mysql.createConnection(serverUrl);
  await admin.query(`CREATE DATABASE \`${name}\``);

  const url = new URL(serverUrl);
  url.pathname = `/${name}`;
  const { db, pool } = createDb(url.toString());
  await migrate(db, { migrationsFolder: "./drizzle" });

  cleanups.push(async () => {
    await pool.end();
    await admin.query(`DROP DATABASE \`${name}\``);
    await admin.end();
  });

  const sent: Parameters<Mailer["notifyNewMessage"]>[0][] = [];
  const mailer: Mailer = { async notifyNewMessage(m) { sent.push(m); } };

  const app = createApp({
    db,
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

  return { app, db, sent, adminToken };
}

// Closes the pools and drops every database setup() created. Call it in afterAll.
export async function teardown() {
  await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
}
