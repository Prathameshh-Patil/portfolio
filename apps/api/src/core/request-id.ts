import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

// Accept an id from the caller (a gateway or another service) if it looks sane, otherwise make one.
const validId = /^[A-Za-z0-9._-]{1,100}$/;

// Gives every request an id: it is in every log line for that request and sent back as X-Request-Id,
// so one failing request can be found in the logs, even when it passed through several services.
export function requestId(req: IncomingMessage, res: ServerResponse) {
  const incoming = req.headers["x-request-id"];
  const id = typeof incoming === "string" && validId.test(incoming) ? incoming : randomUUID();
  res.setHeader("X-Request-Id", id);
  return id;
}
