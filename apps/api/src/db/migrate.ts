import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb } from "./client.js";

// Applies SQL migrations from ./drizzle that haven't been applied yet.
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const { db, pool } = createDb(url);
await migrate(db as never, { migrationsFolder: "./drizzle" });
console.log("Migrations applied");
await pool.end();
