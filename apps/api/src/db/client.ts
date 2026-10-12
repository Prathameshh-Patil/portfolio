import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import pg from "pg";
import * as schema from "./schema.js";

// Any Drizzle Postgres database (real Postgres in production, PGlite in tests).
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export function createDb(databaseUrl: string) {
  // TLS is controlled by the URL: Neon URLs include ?sslmode=require, local ones don't.
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 5 });
  return { db: drizzle(pool, { schema }) as unknown as Db, pool };
}
