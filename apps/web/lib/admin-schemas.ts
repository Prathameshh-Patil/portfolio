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
