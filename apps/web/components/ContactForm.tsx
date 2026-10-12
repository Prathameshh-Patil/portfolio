"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { ApiError, sendContact } from "@/lib/api";
import { contactSchema, type ContactField } from "@/lib/contact";

type Status = "idle" | "sending" | "sent" | "error";
type Errors = Partial<Record<ContactField, string>>;

const fieldClass =
  "mt-1.5 block w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-muted/70 transition-colors focus:border-accent focus:outline-none aria-[invalid=true]:border-red-600 dark:aria-[invalid=true]:border-red-400";

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");

  // Moves keyboard and screen-reader focus to the first field with a problem.
  function focusFirstError(errs: Errors) {
    const first = (["name", "email", "subject", "body"] as const).find((f) => errs[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const raw = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? "").trim(),
      subject: String(form.get("subject") ?? "").trim() || undefined,
      body: String(form.get("body") ?? ""),
    };

    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors = z.flattenError(parsed.error).fieldErrors;
      const errs: Errors = {};
      for (const [field, messages] of Object.entries(fieldErrors)) errs[field as ContactField] = messages?.[0];
      setErrors(errs);
      focusFirstError(errs);
      return;
    }

    setErrors({});
    setFormError("");
    setStatus("sending");
    try {
      // The honeypot is sent as-is: empty for people, filled in by bots (the API then silently drops it).
      await sendContact({ ...parsed.data, website: String(form.get("website") ?? "") });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      if (err instanceof ApiError && err.status === 429) {
        setFormError("You've sent several messages in the last hour. Please try again later, or email me directly.");
      } else if (err instanceof ApiError && err.status === 400 && err.details) {
        const errs: Errors = {};
        for (const [field, messages] of Object.entries(err.details)) errs[field as ContactField] = messages?.[0];
        setErrors(errs);
        setFormError("Please fix the highlighted fields.");
        focusFirstError(errs);
      } else {
        setFormError("Something went wrong and your message wasn't sent. Please try again, or email me directly.");
      }
    }
  }

  // Clears a field's error as soon as the user edits it.
  function clearError(field: ContactField) {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-lg border border-accent bg-accent-soft p-6">
        <p className="font-semibold">Thanks, your message was sent.</p>
        <p className="mt-2 text-sm text-muted">I&apos;ll reply to the email address you gave.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-medium text-accent underline underline-offset-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  const field = (name: ContactField, label: string, input: React.ReactNode, hint?: string) => (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {hint && <span className="ml-1 font-normal text-muted">{hint}</span>}
      </label>
      {input}
      {errors[name] && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-red-700 dark:text-red-400">
          {errors[name]}
        </p>
      )}
    </div>
  );

  const a11y = (name: ContactField) => ({
    id: name,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    onChange: () => clearError(name),
    className: fieldClass,
  });

  return (
    // noValidate: we show our own messages (matching the API) instead of the browser's popups.
    // method="post": if someone submits before JavaScript loads, the browser's fallback must not
    // put their name, email and message into the URL (which a GET would do).
    <form ref={formRef} onSubmit={handleSubmit} method="post" noValidate className="space-y-5">
      {field("name", "Name", <input type="text" autoComplete="name" maxLength={100} {...a11y("name")} />)}
      {field("email", "Email", <input type="email" autoComplete="email" maxLength={200} {...a11y("email")} />)}
      {field("subject", "Subject", <input type="text" maxLength={150} {...a11y("subject")} />, "(optional)")}
      {field("body", "Message", <textarea rows={6} maxLength={5000} {...a11y("body")} />)}

      {/* Honeypot: hidden from people and screen readers, but bots that fill every field will fill it. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {formError && (
        <p role="alert" className="rounded-md border border-red-600/40 px-4 py-3 text-sm text-red-700 dark:border-red-400/40 dark:text-red-400">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-wait disabled:opacity-70"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
