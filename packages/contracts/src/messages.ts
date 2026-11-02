import { z } from "zod";
import { limits, timestamp } from "./common.js";

export const contactSchema = z
  .object({
    name: z.string().trim().min(1).max(limits.name),
    email: z.email().max(limits.email),
    subject: z.string().trim().max(limits.subject).optional(),
    body: z.string().trim().min(limits.bodyMin).max(limits.bodyMax),
    // Honeypot: a hidden field on the form. Real people leave it empty; bots fill it in.
    website: z.string().optional().meta({ description: "Honeypot. Leave empty; filled-in requests are dropped." }),
  })
  .meta({ id: "ContactRequest" });

export const contactResultSchema = z
  .object({ ok: z.literal(true), id: z.number().int().optional() })
  .meta({ id: "ContactResult" });

export const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(limits.pageSize).default(20),
  unread: z.enum(["true", "false"]).optional().meta({ description: "Only unread (`true`) or only read (`false`)" }),
});

export const markReadSchema = z.object({ isRead: z.boolean() }).meta({ id: "MarkReadRequest" });

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

export type ContactInput = z.input<typeof contactSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Stats = z.infer<typeof statsSchema>;
