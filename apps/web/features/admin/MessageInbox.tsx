"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { admin } from "./api";
import { errorMessage, useAdminData } from "@/features/admin/use-admin";
import { FormError, secondaryButtonClass } from "@/components/ui/form";
import { ConfirmButton } from "@/features/admin/ConfirmButton";

const LIMIT = 10;

export function MessageInbox() {
  const router = useRouter();
  const params = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const unreadOnly = params.get("unread") === "1";

  const load = useCallback(() => admin.messages(page, LIMIT, unreadOnly), [page, unreadOnly]);
  const { data, error, reload } = useAdminData(load);
  const [actionError, setActionError] = useState("");

  // Page and filter live in the URL, so the back button and links from the dashboard work.
  function go(next: { page?: number; unread?: boolean }) {
    const query = new URLSearchParams();
    const nextPage = next.page ?? page;
    if (nextPage > 1) query.set("page", String(nextPage));
    if (next.unread ?? unreadOnly) query.set("unread", "1");
    router.push(`/admin/messages${query.size ? `?${query}` : ""}`);
  }

  // Runs an action, then reloads the list so it matches the database.
  async function run(action: () => Promise<unknown>) {
    setActionError("");
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <div className="flex gap-1 rounded-md border border-border p-1 text-sm" role="group" aria-label="Filter messages">
          {[
            { label: "All", unread: false },
            { label: "Unread", unread: true },
          ].map((f) => (
            <button
              key={f.label}
              type="button"
              aria-pressed={unreadOnly === f.unread}
              onClick={() => go({ page: 1, unread: f.unread })}
              className="rounded px-3 py-1 text-muted aria-pressed:bg-accent-soft aria-pressed:text-text"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <FormError message={error ?? actionError} />
        {!data && !error && <p className="text-sm text-muted">Loading…</p>}
        {data?.data.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-5 py-10 text-center text-sm text-muted">
            {page > 1 ? (
              <>
                Nothing on this page. <button type="button" className="underline" onClick={() => go({ page: 1 })}>Go to page 1</button>
              </>
            ) : unreadOnly ? (
              "No unread messages."
            ) : (
              "No messages yet."
            )}
          </p>
        )}

        {data?.data.map((m) => (
          <article
            key={m.id}
            className={`rounded-lg border bg-surface p-5 ${m.isRead ? "border-border" : "border-accent"}`}
            aria-label={`Message from ${m.name}${m.isRead ? "" : " (unread)"}`}
          >
            <header className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {!m.isRead && <span className="mr-2 rounded bg-accent px-1.5 py-0.5 text-xs text-accent-fg">New</span>}
                  {m.name} <span className="font-normal text-muted">&lt;{m.email}&gt;</span>
                </p>
                {m.subject && <p className="mt-1 text-sm">{m.subject}</p>}
              </div>
              <time dateTime={m.createdAt} className="font-mono text-xs text-muted">
                {new Date(m.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </time>
            </header>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">{m.body}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => run(() => admin.setMessageRead(m.id, !m.isRead))}>
                Mark as {m.isRead ? "unread" : "read"}
              </button>
              <a className={secondaryButtonClass} href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? "your message"}`)}`}>
                Reply by email
              </a>
              <ConfirmButton label="Delete" confirmLabel="Delete message" onConfirm={() => run(() => admin.deleteMessage(m.id))} />
            </div>
          </article>
        ))}
      </div>

      {data && data.total > LIMIT && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm">
          <button type="button" className={secondaryButtonClass} disabled={page <= 1} onClick={() => go({ page: page - 1 })}>
            ← Newer
          </button>
          <span className="text-muted">
            Page {page} of {totalPages} · {data.total} messages
          </span>
          <button type="button" className={secondaryButtonClass} disabled={page >= totalPages} onClick={() => go({ page: page + 1 })}>
            Older →
          </button>
        </nav>
      )}
      <p className="mt-8 text-sm text-muted">
        <Link href="/admin" className="hover:text-accent">← Dashboard</Link>
      </p>
    </div>
  );
}
