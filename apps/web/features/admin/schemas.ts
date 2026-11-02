import { limits, slugPattern } from "@portfolio/contracts";
import { z } from "zod";

// Same rules as the API (limits from @portfolio/contracts), with friendlier messages.
// Empty optional text inputs become null, which is what the API stores for "no value".
const optionalUrl = z
  .string()
  .trim()
  .transform((v) => v || null)
  .pipe(z.url("Enter a full URL starting with https://").nullable());

export const projectFormSchema = z.object({
  slug: z.string().regex(slugPattern, `Lowercase letters, numbers and dashes only (max ${limits.slug}).`),
  title: z.string().trim().min(1, "Required.").max(limits.title, `Max ${limits.title} characters.`),
  summary: z.string().trim().min(1, "Required.").max(limits.summary, `Max ${limits.summary.toLocaleString("en")} characters.`),
  techStack: z
    .string()
    .transform((v) => v.split(",").map((t) => t.trim()).filter(Boolean))
    .pipe(
      z
        .array(z.string().max(limits.techItem, `Each item max ${limits.techItem} characters.`))
        .max(limits.techItems, `Max ${limits.techItems} items.`),
    ),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  featured: z.boolean(),
  published: z.boolean(),
});
