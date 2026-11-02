import { z } from "zod";
import { limits, slugPattern, timestamp } from "./common.js";

// Fields without defaults: used for PATCH, so only the fields that were sent get changed.
const projectFields = z.object({
  slug: z.string().regex(slugPattern, "lowercase letters, numbers and dashes only"),
  title: z.string().trim().min(1).max(limits.title),
  summary: z.string().trim().min(1).max(limits.summary),
  techStack: z.array(z.string().trim().min(1).max(limits.techItem)).max(limits.techItems),
  repoUrl: z.url().max(limits.url).nullable().optional(),
  demoUrl: z.url().max(limits.url).nullable().optional(),
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

export const viewsSchema = z.object({ views: z.number().int() }).meta({ id: "ViewCount" });

// What the API returns (dates as ISO strings, as they arrive over JSON).
export type Project = z.infer<typeof projectSchema>;
// What a client sends. `z.input` keeps fields with defaults optional.
export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type UpdateProjectInput = z.input<typeof updateProjectSchema>;
// What the API works with after validation: defaults filled in, strings trimmed.
export type CreateProject = z.output<typeof createProjectSchema>;
export type UpdateProject = z.output<typeof updateProjectSchema>;
