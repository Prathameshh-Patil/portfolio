import { describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config.js";

const required = {
  DATABASE_URL: "mysql://localhost/test",
  JWT_SECRET: "a-secret-that-is-at-least-32-characters-long",
  ADMIN_EMAIL: "admin@example.com",
  ADMIN_PASSWORD_HASH: "$2b$12$hash",
};

describe("config", () => {
  it("prefers MYSQL_URL over DATABASE_URL", () => {
    const config = loadConfig({ ...required, DATABASE_URL: "postgresql://neon/db", MYSQL_URL: "mysql://aiven/db" });
    expect(config.DATABASE_URL).toBe("mysql://aiven/db");
  });

  it("treats empty optional variables as unset (KEY= in .env)", () => {
    const config = loadConfig({ ...required, RESEND_API_KEY: "", CONTACT_TO_EMAIL: "", CONTACT_FROM_EMAIL: "" });
    expect(config.CONTACT_TO_EMAIL).toBeUndefined();
    expect(config.RESEND_API_KEY).toBeUndefined();
  });
});
