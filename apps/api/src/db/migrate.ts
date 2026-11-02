import "dotenv/config";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { createDb } from "./client.js";

// Applies SQL migrations from ./drizzle that haven't been applied yet.
// MYSQL_URL wins over DATABASE_URL, as in config.ts.
const url = process.env.MYSQL_URL || process.env.DATABASE_URL;
if (!url) throw new Error("MYSQL_URL or DATABASE_URL must be set");

const { db, pool } = createDb(url);
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrations applied");
await pool.end();
