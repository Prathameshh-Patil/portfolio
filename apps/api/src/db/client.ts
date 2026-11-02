import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema.js";

export type Db = MySql2Database<typeof schema>;

// TLS options. Hosts with their own certificate authority (Aiven) give a CA certificate: set its PEM text
// as DATABASE_CA and the server is verified against it. Otherwise TLS comes from the URL: Amazon RDS URLs end
// in ?ssl=Amazon%20RDS (mysql2's built-in RDS certificates), other hosts use ?ssl={"rejectUnauthorized":true},
// local ones have no ssl parameter.
function connectionOptions(databaseUrl: string): mysql.PoolOptions {
  const url = new URL(databaseUrl);
  // A Postgres URL here (left over from an old host) would otherwise fail later with a confusing timeout.
  // The message names the scheme, host and port, never the password.
  if (url.protocol !== "mysql:") {
    throw new Error(`DATABASE_URL must be a mysql:// URL, got ${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}`);
  }
  // Hosted MySQL URLs often carry ?ssl-mode=REQUIRED, a MySQL CLI option the driver doesn't know.
  url.searchParams.delete("ssl-mode");
  const ca = process.env.DATABASE_CA?.trim();
  return { uri: url.toString(), ...(ca ? { ssl: { ca, rejectUnauthorized: true } } : {}) };
}

export function createDb(databaseUrl: string) {
  const pool = mysql.createPool({ ...connectionOptions(databaseUrl), connectionLimit: 5, timezone: "Z" });
  // Every connection works in UTC, so NOW() defaults and the dates Drizzle reads back agree.
  pool.pool.on("connection", (conn) => conn.query("SET time_zone = '+00:00'"));
  return { db: drizzle(pool, { schema, mode: "default" }), pool };
}
