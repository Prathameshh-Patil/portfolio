import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { ForbiddenError, UnauthorizedError } from "./errors.js";

// Single admin user: there is no users table. The token only says "this is the admin".
export function signAdminToken(email: string, secret: string) {
  return jwt.sign({ sub: email, role: "admin" }, secret, { expiresIn: "2h" });
}

export function requireAdmin(secret: string): RequestHandler {
  return (req, _res, next) => {
    const header = req.headers.authorization ?? "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return next(new UnauthorizedError("Missing token"));
    }
    try {
      const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
      if (typeof payload === "string" || payload.role !== "admin") {
        return next(new ForbiddenError());
      }
      next();
    } catch {
      next(new UnauthorizedError("Invalid or expired token"));
    }
  };
}
