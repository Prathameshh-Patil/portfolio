import { describe, expect, it, vi } from "vitest";
import { pino } from "pino";
import type { Mailer } from "../../src/integrations/email.js";
import type { MessagesRepository } from "../../src/modules/messages/messages.repository.js";
import { createMessagesService } from "../../src/modules/messages/messages.service.js";

function setup(mailer: Mailer = { notifyNewMessage: vi.fn(async () => {}) }) {
  const repo = {
    create: vi.fn(async () => 7),
    list: vi.fn(async () => ({ rows: [], total: 0 })),
    setRead: vi.fn(async () => undefined),
    remove: vi.fn(async () => false),
    counts: vi.fn(async () => ({ total: 0, unread: 0 })),
  } satisfies MessagesRepository;
  const logger = pino({ enabled: false });
  return { repo, mailer, logger, service: createMessagesService({ repo, mailer, logger }) };
}

const message = { name: "Recruiter", email: "hr@company.com", body: "Are you open to a backend role?" };

describe("messages service", () => {
  it("saves the message, then emails a notification", async () => {
    const { repo, mailer, service } = setup();
    expect(await service.submitContact(message)).toEqual({ ok: true, id: 7 });
    expect(repo.create).toHaveBeenCalledWith(message);
    expect(mailer.notifyNewMessage).toHaveBeenCalledWith(message);
  });

  it("drops honeypot submissions without saving or emailing, but still answers ok", async () => {
    const { repo, mailer, service } = setup();
    expect(await service.submitContact({ ...message, website: "http://spam.example" })).toEqual({ ok: true });
    expect(repo.create).not.toHaveBeenCalled();
    expect(mailer.notifyNewMessage).not.toHaveBeenCalled();
  });

  it("still succeeds when the email provider is down, and logs a warning", async () => {
    const { logger, service } = setup({ notifyNewMessage: async () => Promise.reject(new Error("Resend returned 500")) });
    const warn = vi.spyOn(logger, "warn");
    expect(await service.submitContact(message)).toEqual({ ok: true, id: 7 });
    await vi.waitFor(() => expect(warn).toHaveBeenCalledOnce());
  });

  it("maps the ?unread filter to the read flag the repository expects", async () => {
    const { repo, service } = setup();
    await service.inbox({ page: 2, limit: 10, unread: "true" });
    expect(repo.list).toHaveBeenCalledWith({ page: 2, limit: 10, isRead: false });
    await service.inbox({ page: 1, limit: 10 });
    expect(repo.list).toHaveBeenLastCalledWith({ page: 1, limit: 10, isRead: undefined });
  });

  it("404s when marking a message that doesn't exist", async () => {
    await expect(setup().service.markRead(1, true)).rejects.toThrow("Message not found");
  });
});
