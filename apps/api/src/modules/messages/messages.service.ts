import type { ContactInput, Page } from "@portfolio/contracts";
import type { Logger } from "pino";
import { NotFoundError } from "../../core/errors.js";
import type { Mailer } from "../../integrations/email.js";
import type { MessageRow, MessagesRepository } from "./messages.repository.js";

// The rules about contact messages: the honeypot, saving before emailing, and the admin inbox.
export function createMessagesService(deps: { repo: MessagesRepository; mailer: Mailer; logger: Logger }) {
  const { repo, mailer, logger } = deps;

  return {
    async submitContact({ website, ...data }: ContactInput): Promise<{ ok: true; id?: number }> {
      // Honeypot filled in: a bot. Pretend it worked so it learns nothing, and store nothing.
      if (website) return { ok: true };

      const id = await repo.create(data);
      // The message is already saved, so an email failure must not fail the request: log it and move on.
      mailer.notifyNewMessage(data).catch((err) => logger.warn({ err, messageId: id }, "Email notification failed"));
      return { ok: true, id };
    },

    async inbox(opts: { page: number; limit: number; unread?: "true" | "false" }): Promise<Page<MessageRow>> {
      const isRead = opts.unread === undefined ? undefined : opts.unread === "false";
      const { rows, total } = await repo.list({ page: opts.page, limit: opts.limit, isRead });
      return { data: rows, page: opts.page, limit: opts.limit, total };
    },

    async markRead(id: number, isRead: boolean) {
      const message = await repo.setRead(id, isRead);
      if (!message) throw new NotFoundError("Message not found");
      return message;
    },

    async remove(id: number) {
      if (!(await repo.remove(id))) throw new NotFoundError("Message not found");
    },
  };
}

export type MessagesService = ReturnType<typeof createMessagesService>;
