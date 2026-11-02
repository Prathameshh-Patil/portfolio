// Database errors the rest of the app may care about, without knowing which database is behind them.
export class DuplicateKeyError extends Error {}

// MySQL's error for a unique key violation. Drizzle may wrap the driver error in `cause`.
export function isDuplicateKey(err: unknown) {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "ER_DUP_ENTRY" || e?.cause?.code === "ER_DUP_ENTRY";
}
