import { randomBytes } from "node:crypto";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import { createDb } from "../src/db/client.js";

// Measures what the indexes in drizzle/0001_indexes.sql buy for the admin inbox.
// Loads ROWS messages into a throwaway database, then runs each query with and without its index.
// Usage: npm run bench:indexes -w apps/api   (needs the compose MySQL, like the tests)

const ROWS = Number(process.env.ROWS ?? 200_000);
const RUNS = 30;
const serverUrl = process.env.TEST_DATABASE_URL ?? "mysql://root:portfolio@localhost:3307";

const queries = [
  {
    name: "Unread inbox, page 1",
    sql: (hint: string) =>
      `SELECT * FROM messages ${hint} WHERE is_read = false ORDER BY created_at DESC, id DESC LIMIT 20`,
  },
  {
    name: "Unread count (badge)",
    sql: (hint: string) => `SELECT COUNT(*) FROM messages ${hint} WHERE is_read = false`,
  },
  {
    name: "All messages, page 1",
    sql: (hint: string) => `SELECT * FROM messages ${hint} ORDER BY created_at DESC, id DESC LIMIT 20`,
  },
];
const noIndex = "IGNORE INDEX (messages_inbox_idx, messages_created_idx)";

const name = `portfolio_bench_${randomBytes(4).toString("hex")}`;
const admin = await mysql.createConnection(serverUrl);
await admin.query(`CREATE DATABASE \`${name}\``);
const url = new URL(serverUrl);
url.pathname = `/${name}`;
const { db, pool } = createDb(url.toString());

try {
  await migrate(db, { migrationsFolder: "./drizzle" });

  // One INSERT ... SELECT from a number sequence: one message per minute going back in time, 1 in 10 unread.
  console.log(`Loading ${ROWS.toLocaleString()} messages...`);
  const conn = await pool.getConnection();
  await conn.query(`SET SESSION cte_max_recursion_depth = ${ROWS}`);
  await conn.query(`
    INSERT INTO messages (name, email, subject, body, is_read, created_at)
    WITH RECURSIVE seq (n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < ${ROWS})
    SELECT CONCAT('Sender ', n), CONCAT('sender', n, '@example.com'), 'Hello',
           REPEAT('Message body. ', 20), n % 10 <> 0, NOW() - INTERVAL n MINUTE
    FROM seq`);
  conn.release();
  await pool.query("ANALYZE TABLE messages");

  const median = async (sql: string) => {
    const times: number[] = [];
    for (let i = 0; i < RUNS; i++) {
      const start = performance.now();
      await pool.query(sql);
      times.push(performance.now() - start);
    }
    return times.sort((a, b) => a - b)[Math.floor(RUNS / 2)];
  };
  // EXPLAIN's access type and key: "ALL" with no key means a full table scan.
  const plan = async (sql: string) => {
    const [[row]] = (await pool.query(`EXPLAIN ${sql}`)) as unknown as [{ type: string; key: string | null; Extra: string | null }[]];
    return `${row.type} / ${row.key ?? "no index"}${row.Extra?.includes("filesort") ? " + filesort" : ""}`;
  };

  const results = [];
  for (const q of queries) {
    const without = await median(q.sql(noIndex));
    const withIdx = await median(q.sql(""));
    results.push({
      query: q.name,
      "without index (ms)": without.toFixed(2),
      "with index (ms)": withIdx.toFixed(2),
      speedup: `${(without / withIdx).toFixed(0)}x`,
      "plan without": await plan(q.sql(noIndex)),
      "plan with": await plan(q.sql("")),
    });
  }
  console.log(`\nMedian of ${RUNS} runs on ${ROWS.toLocaleString()} messages:`);
  console.table(results);
} finally {
  await pool.end();
  await admin.query(`DROP DATABASE \`${name}\``);
  await admin.end();
}
