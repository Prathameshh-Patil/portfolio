import { z } from "zod";
import { limits } from "./common.js";

export const loginSchema = z
  .object({ email: z.email(), password: z.string().min(1).max(limits.password) })
  .meta({ id: "LoginRequest" });

export const tokenSchema = z
  .object({ token: z.string().meta({ description: "JWT, valid for 2 hours" }) })
  .meta({ id: "Token" });

export type LoginInput = z.infer<typeof loginSchema>;
