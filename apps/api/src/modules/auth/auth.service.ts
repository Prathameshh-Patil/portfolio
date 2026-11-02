import bcrypt from "bcryptjs";
import type { LoginInput } from "@portfolio/contracts";
import { signAdminToken } from "../../core/auth.js";
import { UnauthorizedError } from "../../core/errors.js";

// Single admin, no users table: the email and a bcrypt hash come from the environment.
export function createAuthService(opts: { adminEmail: string; adminPasswordHash: string; jwtSecret: string }) {
  return {
    async login({ email, password }: LoginInput) {
      // Always run bcrypt, even for a wrong email, so response time doesn't reveal which part was wrong.
      const passwordOk = await bcrypt.compare(password, opts.adminPasswordHash);
      const emailOk = email.toLowerCase() === opts.adminEmail.toLowerCase();
      if (!passwordOk || !emailOk) throw new UnauthorizedError("Invalid email or password");
      return { token: signAdminToken(opts.adminEmail, opts.jwtSecret) };
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
