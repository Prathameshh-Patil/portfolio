"use client";

import Link from "next/link";
import { useState } from "react";
import { admin } from "@/lib/api";
import { statusLabels } from "@/lib/publications";
import { errorMessage, useAdminData } from "@/lib/use-admin";
import { FormError, primaryButtonClass, secondaryButtonClass } from "../form";
import { ConfirmButton } from "./ConfirmButton";

export function PublicationList() {
  const { data, error, reload } = useAdminData(admin.publications);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError("");
    try {
      await action();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
      reload();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Publications</h1>
          <p className="mt-1 text-sm text-muted">The Research page appears in the site navigation once at least one publication is visible.</p>
        </div>
        <Link href="/admin/publications/new" className={primaryButtonClass}>New publication</Link>
      </div>

      <div className="mt-6 space-y-3">
        <FormError message={error ?? actionError} />
        {!data && !error && <p className="text-sm text-muted">Loading…</p>}
        {data?.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-5 py-10 text-center text-sm text-muted">
            No publications yet. Add only real papers: the Research page stays hidden until you do.
          </p>
        )}
        <ul className="space-y-3">
          {data?.map((paper) => (
            <li key={paper.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-border bg-surface p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {paper.title}
                  {!paper.visible && <span className="ml-2 rounded border border-border px-1.5 py-0.5 text-xs font-normal text-muted">Hidden</span>}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {statusLabels[paper.status]}
                  {paper.venue && ` · ${paper.venue}`}
                  {paper.year && ` · ${paper.year}`} · order {paper.sortOrder}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" disabled={busy} className={secondaryButtonClass} onClick={() => run(() => admin.updatePublication(paper.id, { visible: !paper.visible }))}>
                  {paper.visible ? "Hide" : "Show"}
                </button>
                <Link href={`/admin/publications/${paper.id}`} className={secondaryButtonClass}>Edit</Link>
                <ConfirmButton label="Delete" confirmLabel="Delete publication" onConfirm={() => run(() => admin.deletePublication(paper.id))} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
