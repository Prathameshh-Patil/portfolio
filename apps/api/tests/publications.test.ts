import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { setup } from "./helpers.js";

let ctx: Awaited<ReturnType<typeof setup>>;
let token: string;

beforeAll(async () => {
  ctx = await setup();
  token = await ctx.adminToken();
});

const auth = () => ({ Authorization: `Bearer ${token}` });

const samplePaper = {
  title: "A sample paper",
  authors: "A. Author, B. Author",
  venue: "Sample Conference",
  year: 2025,
  status: "published",
  url: "https://example.com/paper",
  summary: "What the paper found, in plain English.",
};

describe("publications", () => {
  let paperId: number;

  it("starts empty on the public endpoint", async () => {
    const res = await request(ctx.app).get("/api/publications");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("requires a token for every admin publication route", async () => {
    expect((await request(ctx.app).get("/api/admin/publications")).status).toBe(401);
    expect((await request(ctx.app).post("/api/admin/publications").send(samplePaper)).status).toBe(401);
    expect((await request(ctx.app).patch("/api/admin/publications/1").send({ visible: false })).status).toBe(401);
    expect((await request(ctx.app).delete("/api/admin/publications/1")).status).toBe(401);
  });

  it("lets the admin create a publication with defaults", async () => {
    const res = await request(ctx.app).post("/api/admin/publications").set(auth()).send(samplePaper);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "A sample paper", status: "published", visible: true, sortOrder: 0 });
    paperId = res.body.id;
  });

  it("accepts a minimal publication (venue, year and link are optional)", async () => {
    const res = await request(ctx.app)
      .post("/api/admin/publications")
      .set(auth())
      .send({ title: "Preprint", authors: "A. Author", status: "preprint", summary: "Short summary." });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ venue: null, year: null, url: null });
  });

  it("rejects an unknown status, a bad link and a missing title", async () => {
    const res = await request(ctx.app)
      .post("/api/admin/publications")
      .set(auth())
      .send({ ...samplePaper, status: "maybe", url: "not a url", title: "" });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.details).sort()).toEqual(["status", "title", "url"]);
  });

  it("lists visible publications publicly, newest year first", async () => {
    const res = await request(ctx.app).get("/api/publications");
    expect(res.body.map((p: { title: string }) => p.title)).toEqual(["A sample paper", "Preprint"]);
  });

  it("PATCH changes only the fields sent", async () => {
    const res = await request(ctx.app)
      .patch(`/api/admin/publications/${paperId}`)
      .set(auth())
      .send({ status: "accepted" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "accepted", title: "A sample paper", year: 2025 });
  });

  it("rejects an empty PATCH", async () => {
    const res = await request(ctx.app).patch(`/api/admin/publications/${paperId}`).set(auth()).send({});
    expect(res.status).toBe(400);
  });

  it("hides invisible publications from the public API but not from the admin", async () => {
    await request(ctx.app).patch(`/api/admin/publications/${paperId}`).set(auth()).send({ visible: false });
    const pub = await request(ctx.app).get("/api/publications");
    expect(pub.body.map((p: { id: number }) => p.id)).not.toContain(paperId);
    const admin = await request(ctx.app).get("/api/admin/publications").set(auth());
    expect(admin.body.map((p: { id: number }) => p.id)).toContain(paperId);
  });

  it("returns 404 when updating or deleting an unknown publication", async () => {
    expect((await request(ctx.app).patch("/api/admin/publications/9999").set(auth()).send({ visible: true })).status).toBe(404);
    expect((await request(ctx.app).delete("/api/admin/publications/9999").set(auth())).status).toBe(404);
  });

  it("lets the admin delete a publication", async () => {
    const res = await request(ctx.app).delete(`/api/admin/publications/${paperId}`).set(auth());
    expect(res.status).toBe(204);
    const admin = await request(ctx.app).get("/api/admin/publications").set(auth());
    expect(admin.body.map((p: { id: number }) => p.id)).not.toContain(paperId);
  });
});
