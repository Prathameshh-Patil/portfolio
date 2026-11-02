import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema.js";

export type Db = MySql2Database<typeof schema>;

export function createDb(databaseUrl: string) {
  // TLS is controlled by the URL: Amazon RDS URLs end in ?ssl=Amazon%20RDS (mysql2's built-in RDS
  // certificates), other hosts use ?ssl={"rejectUnauthorized":true}, local ones have no ssl parameter.
  const pool = mysql.createPool({ uri: databaseUrl, connectionLimit: 5, timezone: "Z" });
  // Every connection works in UTC, so NOW() defaults and the dates Drizzle reads back agree.
  pool.pool.on("connection", (conn) => conn.query("SET time_zone = '+00:00'"));
  return { db: drizzle(pool, { schema, mode: "default" }), pool };
}
