import "dotenv/config";
import { z } from "zod";

// All environment variables are validated once at startup.
// If something is missing, the server refuses to start with a clear error.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGINS: z.string().default("http://localhost:3000"), // comma-separated
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD_HASH: z.string().min(1), // bcrypt hash, see `npm run hash-password`
  RESEND_API_KEY: z.string().optional(),
  CONTACT_TO_EMAIL: z.email().optional(),
  CONTACT_FROM_EMAIL: z.string().optional(),
});

export type Config = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  // `KEY=` in an env file gives "", not undefined. Treat it as unset so optional fields stay optional.
  const withoutEmpty = Object.fromEntries(Object.entries(env).filter(([, value]) => value !== ""));
  const parsed = envSchema.safeParse(withoutEmpty);
  if (!parsed.success) {
    console.error("Invalid environment variables:", z.prettifyError(parsed.error));
    process.exit(1);
  }
  return parsed.data;
}
