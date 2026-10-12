import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../lib/errors.js";

// Single admin user: there is no users table. The token only says "this is the admin".
export function signAdminToken(email: string, secret: string) {
  return jwt.sign({ sub: email, role: "admin" }, secret, { expiresIn: "2h" });
}

export function requireAdmin(secret: string): RequestHandler {
  return (req, _res, next) => {
    const header = req.headers.authorization ?? "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return next(new HttpError(401, "Missing token"));
    }
    try {
      const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
      if (typeof payload === "string" || payload.role !== "admin") {
        return next(new HttpError(403, "Forbidden"));
      }
      next();
    } catch {
      next(new HttpError(401, "Invalid or expired token"));
    }
  };
}
