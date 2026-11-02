import { z } from "zod";

// Every request and response shape of the API. The routes validate with these schemas and
// openapi.ts builds the documentation from the same ones, so the docs can't drift from the code.

// ---- Path and query parameters ----

export const slugParam = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,80}$/).meta({ description: "Project slug", example: "slotwise" }),
});

export const idParam = z.object({
  id: z.coerce.number().int().positive().meta({ description: "Numeric id", example: 1 }),
});

export const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unread: z.enum(["true", "false"]).optional().meta({ description: "Only unread (`true`) or only read (`false`)" }),
});

// ---- Request bodies ----

export const contactSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z.email().max(200),
    subject: z.string().trim().max(150).optional(),
    body: z.string().trim().min(10).max(5000),
    // Honeypot: a hidden field on the form. Real people leave it empty; bots fill it in.
    website: z.string().optional().meta({ description: "Honeypot. Leave empty; filled-in requests are dropped." }),
  })
  .meta({ id: "ContactRequest" });

export const loginSchema = z
  .object({ email: z.email(), password: z.string().min(1).max(200) })
  .meta({ id: "LoginRequest" });

// Fields without defaults: used for PATCH, so only the fields that were sent get changed.
const projectFields = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,80}$/, "lowercase letters, numbers and dashes only"),
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(2000),
  techStack: z.array(z.string().trim().min(1).max(40)).max(20),
  repoUrl: z.url().max(500).nullable().optional(),
  demoUrl: z.url().max(500).nullable().optional(),
  featured: z.boolean(),
  published: z.boolean(),
  sortOrder: z.number().int(),
});

// For POST: the optional fields get sensible defaults.
export const createProjectSchema = projectFields
  .extend({
    techStack: projectFields.shape.techStack.default([]),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
  })
  .meta({ id: "CreateProjectRequest" });

export const updateProjectSchema = projectFields.partial().meta({ id: "UpdateProjectRequest" });

export const markReadSchema = z.object({ isRead: z.boolean() }).meta({ id: "MarkReadRequest" });

// ---- Responses ----

const timestamp = z.iso.datetime();

export const projectSchema = z
  .object({
    id: z.number().int(),
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    techStack: z.array(z.string()),
    repoUrl: z.string().nullable(),
    demoUrl: z.string().nullable(),
    featured: z.boolean(),
    published: z.boolean(),
    sortOrder: z.number().int(),
    views: z.number().int(),
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  .meta({ id: "Project" });

export const messageSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    email: z.string(),
    subject: z.string().nullable(),
    body: z.string(),
    isRead: z.boolean(),
    createdAt: timestamp,
  })
  .meta({ id: "Message" });

export const messagePageSchema = z
  .object({ data: z.array(messageSchema), page: z.number().int(), limit: z.number().int(), total: z.number().int() })
  .meta({ id: "MessagePage" });

export const statsSchema = z
  .object({
    messages: z.number().int(),
    unreadMessages: z.number().int(),
    topProjects: z.array(z.object({ slug: z.string(), title: z.string(), views: z.number().int() })),
  })
  .meta({ id: "Stats" });

export const viewsSchema = z.object({ views: z.number().int() }).meta({ id: "ViewCount" });

export const contactResultSchema = z
  .object({ ok: z.literal(true), id: z.number().int().optional() })
  .meta({ id: "ContactResult" });

export const tokenSchema = z
  .object({ token: z.string().meta({ description: "JWT, valid for 2 hours" }) })
  .meta({ id: "Token" });

export const healthSchema = z.object({ status: z.literal("ok") }).meta({ id: "Health" });

export const errorSchema = z
  .object({
    error: z.string(),
    details: z.record(z.string(), z.array(z.string())).optional().meta({ description: "Field name → problems" }),
  })
  .meta({ id: "Error" });
