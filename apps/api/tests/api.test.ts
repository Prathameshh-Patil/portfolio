import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { ADMIN_EMAIL, setup } from "./helpers.js";

let ctx: Awaited<ReturnType<typeof setup>>;
let token: string;

beforeAll(async () => {
  ctx = await setup();
  token = await ctx.adminToken();
});

const auth = () => ({ Authorization: `Bearer ${token}` });

const sampleProject = {
  slug: "slotwise",
  title: "Slotwise",
  summary: "Event booking platform",
  techStack: ["Next.js", "PostgreSQL"],
  repoUrl: "https://github.com/Prathameshh-Patil/slotwise",
  featured: true,
};

describe("health", () => {
  it("reports ok when the database is reachable", async () => {
    const res = await request(ctx.app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("auth", () => {
  it("rejects a wrong password", async () => {
    const res = await request(ctx.app).post("/api/auth/login").send({ email: ADMIN_EMAIL, password: "nope" });
    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
  });

  it("blocks admin routes without a token", async () => {
    expect((await request(ctx.app).get("/api/admin/messages")).status).toBe(401);
  });

  it("blocks admin routes with a forged token", async () => {
    const res = await request(ctx.app).get("/api/admin/messages").set("Authorization", "Bearer abc.def.ghi");
    expect(res.status).toBe(401);
  });
});

describe("projects", () => {
  let projectId: number;

  it("lets the admin create a project", async () => {
    const res = await request(ctx.app).post("/api/admin/projects").set(auth()).send(sampleProject);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ slug: "slotwise", published: true, views: 0 });
    projectId = res.body.id;
  });

  it("rejects a duplicate slug with 409", async () => {
    const res = await request(ctx.app).post("/api/admin/projects").set(auth()).send(sampleProject);
    expect(res.status).toBe(409);
  });

  it("validates the body", async () => {
    const res = await request(ctx.app).post("/api/admin/projects").set(auth()).send({ slug: "Bad Slug!" });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty("slug");
  });

  it("lists published projects publicly", async () => {
    const res = await request(ctx.app).get("/api/projects");
    expect(res.status).toBe(200);
    expect(res.body.map((p: { slug: string }) => p.slug)).toContain("slotwise");
  });

  it("PATCH changes only the fields sent", async () => {
    const res = await request(ctx.app).patch(`/api/admin/projects/${projectId}`).set(auth()).send({ title: "Slotwise v2" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: "Slotwise v2", featured: true, published: true });
  });

  it("hides unpublished projects from the public API", async () => {
    await request(ctx.app).patch(`/api/admin/projects/${projectId}`).set(auth()).send({ published: false });
    expect((await request(ctx.app).get("/api/projects/slotwise")).status).toBe(404);
    await request(ctx.app).patch(`/api/admin/projects/${projectId}`).set(auth()).send({ published: true });
  });

  it("counts 50 concurrent views without losing any", async () => {
    await Promise.all(
      Array.from({ length: 50 }, () => request(ctx.app).post("/api/projects/slotwise/view")),
    );
    const res = await request(ctx.app).get("/api/projects/slotwise");
    expect(res.body.views).toBe(50);
  });

  it("returns 404 for an unknown project", async () => {
    expect((await request(ctx.app).get("/api/projects/does-not-exist")).status).toBe(404);
  });
});

describe("contact form", () => {
  const valid = { name: "Recruiter", email: "hr@company.com", subject: "Interview", body: "We'd like to talk to you about a role." };

  it("saves the message and sends a notification", async () => {
    const before = ctx.sent.length;
    const res = await request(ctx.app).post("/api/contact").send(valid);
    expect(res.status).toBe(201);
    expect(ctx.sent.length).toBe(before + 1);

    const list = await request(ctx.app).get("/api/admin/messages").set(auth());
    expect(list.body.data[0]).toMatchObject({ email: "hr@company.com", isRead: false });
  });

  it("rejects an invalid email", async () => {
    const res = await request(ctx.app).post("/api/contact").send({ ...valid, email: "not-an-email" });
    expect(res.status).toBe(400);
  });

  it("silently drops bot submissions (honeypot)", async () => {
    const list = async () => (await request(ctx.app).get("/api/admin/messages").set(auth())).body.total;
    const before = await list();
    const res = await request(ctx.app).post("/api/contact").send({ ...valid, website: "http://spam.example" });
    expect(res.status).toBe(201);
    expect(await list()).toBe(before);
  });

  it("lets the admin mark a message read and delete it", async () => {
    const { body } = await request(ctx.app).get("/api/admin/messages").set(auth());
    const id = body.data[0].id;
    const patched = await request(ctx.app).patch(`/api/admin/messages/${id}`).set(auth()).send({ isRead: true });
    expect(patched.body.isRead).toBe(true);
    expect((await request(ctx.app).delete(`/api/admin/messages/${id}`).set(auth())).status).toBe(204);
  });
});

describe("rate limiting", () => {
  it("blocks the 4th contact message within an hour when the limit is 3", async () => {
    const limited = await setup({ contactLimit: 3 });
    const msg = { name: "A", email: "a@b.com", body: "Hello there, this is a test." };
    for (let i = 0; i < 3; i++) {
      expect((await request(limited.app).post("/api/contact").send(msg)).status).toBe(201);
    }
    expect((await request(limited.app).post("/api/contact").send(msg)).status).toBe(429);
  });
});
