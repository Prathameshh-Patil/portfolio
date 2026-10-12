import { z } from "zod";

// Same rules as the API (apps/api/src/routes/admin.ts), with friendlier messages.
// Empty optional text inputs become null, which is what the API stores for "no value".
const optionalUrl = z
  .string()
  .trim()
  .transform((v) => v || null)
  .pipe(z.url("Enter a full URL starting with https://").nullable());

export const projectFormSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,80}$/, "Lowercase letters, numbers and dashes only (max 80)."),
  title: z.string().trim().min(1, "Required.").max(120, "Max 120 characters."),
  summary: z.string().trim().min(1, "Required.").max(2000, "Max 2,000 characters."),
  techStack: z
    .string()
    .transform((v) => v.split(",").map((t) => t.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(40, "Each item max 40 characters.")).max(20, "Max 20 items.")),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  featured: z.boolean(),
  published: z.boolean(),
});

export const publicationStatuses = ["published", "accepted", "under_review", "preprint"] as const;

export const publicationFormSchema = z.object({
  title: z.string().trim().min(1, "Required.").max(300, "Max 300 characters."),
  authors: z.string().trim().min(1, "Required.").max(1000, "Max 1,000 characters."),
  venue: z
    .string()
    .trim()
    .max(200, "Max 200 characters.")
    .transform((v) => v || null),
  year: z
    .string()
    .trim()
    .transform((v) => (v ? Number(v) : null))
    .pipe(z.number("Enter a year.").int().min(1900, "Enter a year from 1900.").max(2100, "Enter a year up to 2100.").nullable()),
  status: z.enum(publicationStatuses),
  url: optionalUrl,
  summary: z.string().trim().min(1, "Required.").max(2000, "Max 2,000 characters."),
  visible: z.boolean(),
  sortOrder: z.coerce.number().int("Whole number only."),
});
