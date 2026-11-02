import { limits } from "@portfolio/contracts";
import { z } from "zod";

// The API's contact rules (same limits, from @portfolio/contracts) with messages written for people,
// so the browser catches mistakes before a request is sent. The API still validates: client checks
// are for convenience only.
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(limits.name, `Keep your name under ${limits.name} characters.`),
  email: z.email("Please enter a valid email address.").max(limits.email, `Keep your email under ${limits.email} characters.`),
  subject: z.string().trim().max(limits.subject, `Keep the subject under ${limits.subject} characters.`).optional(),
  body: z
    .string()
    .trim()
    .min(limits.bodyMin, `Please write at least ${limits.bodyMin} characters.`)
    .max(limits.bodyMax, `Keep your message under ${limits.bodyMax.toLocaleString("en")} characters.`),
});

export type ContactField = keyof z.infer<typeof contactSchema>;
