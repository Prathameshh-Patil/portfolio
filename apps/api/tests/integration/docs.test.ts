import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import type { z } from "zod";
import {
  contactResultSchema,
  errorSchema,
  healthSchema,
  messagePageSchema,
  messageSchema,
  projectSchema,
  statsSchema,
  tokenSchema,
  viewsSchema,
} from "@portfolio/contracts";
import { ADMIN_EMAIL, ADMIN_PASSWORD, setup, teardown } from "../helpers.js";

let ctx: Awaited<ReturnType<typeof setup>>;
let token: string;

beforeAll(async () => {
  ctx = await setup();
  token = await ctx.adminToken();
});

afterAll(teardown);

const auth = () => ({ Authorization: `Bearer ${token}` });

// Fails with the exact field if a real response doesn't have the documented shape.
function expectShape(schema: z.ZodType, body: unknown) {
  const result = schema.safeParse(body);
  expect(result.error?.issues ?? []).toEqual([]);
}

describe("OpenAPI document", () => {
  it("is served as OpenAPI 3.1 and documents every endpoint", async () => {
    const res = await request(ctx.app).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.1.0");
    expect(Object.keys(res.body.paths).sort()).toEqual([
      "/api/admin/messages",
      "/api/admin/messages/{id}",
      "/api/admin/projects",
      "/api/admin/projects/{id}",
      "/api/admin/stats",
      "/api/auth/login",
      "/api/contact",
      "/api/projects",
      "/api/projects/{slug}",
      "/api/projects/{slug}/view",
      "/health",
    ]);
    expect(res.body.components.schemas).toHaveProperty("Project");
    expect(res.body.paths["/api/admin/stats"].get.security).toEqual([{ bearerAuth: [] }]);
  });

  it("serves Swagger UI at /docs with a policy that allows only its CDN", async () => {
    const res = await request(ctx.app).get("/docs");
    expect(res.status).toBe(200);
    expect(res.text).toContain('id="swagger-ui"');
    expect(res.headers["content-security-policy"]).toContain("script-src 'self' https://cdn.jsdelivr.net;");
  });
});

// Each real response is checked against the schema the docs publish for it.
describe("responses match the documentation", () => {
  it("public, auth and admin endpoints", async () => {
    const created = await request(ctx.app)
      .post("/api/admin/projects")
      .set(auth())
      .send({ slug: "replydesk", title: "ReplyDesk", summary: "AI support inbox", techStack: ["Next.js"] });
    expect(created.status).toBe(201);
    expectShape(projectSchema, created.body);

    expectShape(healthSchema, (await request(ctx.app).get("/health")).body);
    expectShape(projectSchema.array(), (await request(ctx.app).get("/api/projects")).body);
    expectShape(projectSchema, (await request(ctx.app).get("/api/projects/replydesk")).body);
    expectShape(viewsSchema, (await request(ctx.app).post("/api/projects/replydesk/view")).body);

    const login = await request(ctx.app).post("/api/auth/login").send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    expectShape(tokenSchema, login.body);

    const contact = await request(ctx.app)
      .post("/api/contact")
      .send({ name: "Recruiter", email: "hr@company.com", body: "Are you open to a backend role?" });
    expect(contact.status).toBe(201);
    expectShape(contactResultSchema, contact.body);

    const inbox = await request(ctx.app).get("/api/admin/messages").set(auth());
    expectShape(messagePageSchema, inbox.body);
    const patched = await request(ctx.app)
      .patch(`/api/admin/messages/${inbox.body.data[0].id}`)
      .set(auth())
      .send({ isRead: true });
    expectShape(messageSchema, patched.body);

    expectShape(statsSchema, (await request(ctx.app).get("/api/admin/stats").set(auth())).body);
    const updated = await request(ctx.app).patch(`/api/admin/projects/${created.body.id}`).set(auth()).send({ featured: true });
    expectShape(projectSchema, updated.body);
  });

  it("errors", async () => {
    const invalid = await request(ctx.app).post("/api/contact").send({ email: "nope" });
    expect(invalid.status).toBe(400);
    expectShape(errorSchema, invalid.body);
    expectShape(errorSchema, (await request(ctx.app).get("/api/projects/missing")).body);
    expectShape(errorSchema, (await request(ctx.app).get("/api/admin/stats")).body);
  });
});
