import { Router } from "express";
import { sql } from "drizzle-orm";
import type { Db } from "../../db/client.js";
import { asyncHandler } from "../../core/errors.js";

// GET /health : for the hosting platform and load balancers. Also confirms the database is reachable.
export function healthRoutes(db: Db) {
  const router = Router();

  router.get(
    "/health",
    asyncHandler(async (_req, res) => {
      await db.execute(sql`select 1`);
      res.json({ status: "ok" });
    }),
  );

  return router;
}
