import { z } from "zod";

// Same rules as the API's contactSchema (apps/api/src/routes/public.ts), so the browser catches
// mistakes before a request is sent. The API still validates: client checks are for convenience only.
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100, "Keep your name under 100 characters."),
  email: z.email("Please enter a valid email address.").max(200, "Keep your email under 200 characters."),
  subject: z.string().trim().max(150, "Keep the subject under 150 characters.").optional(),
  body: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters.")
    .max(5000, "Keep your message under 5,000 characters."),
});

export type ContactField = keyof z.infer<typeof contactSchema>;
