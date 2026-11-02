import type { Config } from "../config.js";

export interface Mailer {
  notifyNewMessage(msg: { name: string; email: string; subject?: string | null; body: string }): Promise<void>;
}

// Sends a notification email through Resend's HTTP API.
// If Resend is not configured, it does nothing (messages are still saved in the database).
export function createMailer(config: Pick<Config, "RESEND_API_KEY" | "CONTACT_TO_EMAIL" | "CONTACT_FROM_EMAIL">): Mailer {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = config;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    return { async notifyNewMessage() {} };
  }
  return {
    async notifyNewMessage(msg) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: CONTACT_FROM_EMAIL,
          to: CONTACT_TO_EMAIL,
          reply_to: msg.email,
          subject: `Portfolio: ${msg.subject || `message from ${msg.name}`}`,
          text: `From: ${msg.name} <${msg.email}>\n\n${msg.body}`,
        }),
      });
      if (!res.ok) throw new Error(`Resend returned ${res.status}`);
    },
  };
}
