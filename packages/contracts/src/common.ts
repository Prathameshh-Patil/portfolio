import { z } from "zod";

// Field limits in one place. The API's schemas enforce them; the website's forms reuse the same
// numbers with friendlier messages, so the two can never disagree about what is valid.
export const limits = {
  slug: 80,
  title: 120,
  summary: 2000,
  techItem: 40,
  techItems: 20,
  url: 500,
  name: 100,
  email: 200,
  subject: 150,
  bodyMin: 10,
  bodyMax: 5000,
  password: 200,
  pageSize: 100,
} as const;

export const slugPattern = /^[a-z0-9-]{1,80}$/;

export const timestamp = z.iso.datetime();

export const slugParam = z.object({
  slug: z.string().regex(slugPattern).meta({ description: "Project slug", example: "slotwise" }),
});

export const idParam = z.object({
  id: z.coerce.number().int().positive().meta({ description: "Numeric id", example: 1 }),
});

export const errorSchema = z
  .object({
    error: z.string(),
    details: z.record(z.string(), z.array(z.string())).optional().meta({ description: "Field name → problems" }),
  })
  .meta({ id: "Error" });

export const healthSchema = z.object({ status: z.literal("ok") }).meta({ id: "Health" });

export type ApiErrorBody = z.infer<typeof errorSchema>;

// The envelope of every paginated list.
export type Page<T> = { data: T[]; page: number; limit: number; total: number };
