"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@portfolio/contracts";
import { admin } from "./api";
import { errorMessage, useAdminData } from "@/features/admin/use-admin";
import { FormError, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { ConfirmButton } from "@/features/admin/ConfirmButton";

export function ProjectList() {
  const { data: projects, error, reload } = useAdminData(admin.projects);
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
      reload(); // always show what the database now holds, even after a partial failure
    }
  }

  // Moves a project up or down. Renumbers the whole list 1..n and saves only the rows whose number
  // changed. Renumbering (instead of swapping two values) also fixes ties, e.g. two projects both at 0.
  // Trade-off: these are separate PATCH calls, not one transaction; a bulk reorder endpoint would be atomic.
  function move(list: Project[], index: number, delta: -1 | 1) {
    const reordered = [...list];
    const [item] = reordered.splice(index, 1);
    reordered.splice(index + delta, 0, item);
    const changed = reordered.map((p, i) => ({ p, order: i + 1 })).filter(({ p, order }) => p.sortOrder !== order);
    return run(() => Promise.all(changed.map(({ p, order }) => admin.updateProject(p.id, { sortOrder: order }))));
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.02em]">Projects</h1>
          <p className="mt-1 text-sm text-muted">The public list shows featured projects first, then this order.</p>
        </div>
        <Link href="/admin/projects/new" className={primaryButtonClass}>New project</Link>
      </div>

      <div className="mt-6 space-y-3">
        <FormError message={error ?? actionError} />
        {!projects && !error && <p className="text-sm text-muted">Loading…</p>}
        {projects?.length === 0 && <p className="text-sm text-muted">No projects yet.</p>}

        <ol className="space-y-3">
          {projects?.map((p, i) => (
            <li key={p.id} className="card flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
              <div className="flex flex-col gap-1">
                <button type="button" disabled={busy || i === 0} onClick={() => move(projects, i, -1)} aria-label={`Move ${p.title} up`} className="rounded px-2 text-muted hover:text-accent disabled:opacity-30">
                  ↑
                </button>
                <button type="button" disabled={busy || i === projects.length - 1} onClick={() => move(projects, i, 1)} aria-label={`Move ${p.title} down`} className="rounded px-2 text-muted hover:text-accent disabled:opacity-30">
                  ↓
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {p.title}
                  {p.featured && <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-normal text-accent">Featured</span>}
                  {!p.published && <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-xs font-normal text-muted">Draft</span>}
                </p>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  /{p.slug} · {p.views.toLocaleString("en-IN")} views
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" disabled={busy} className={secondaryButtonClass} onClick={() => run(() => admin.updateProject(p.id, { published: !p.published }))}>
                  {p.published ? "Unpublish" : "Publish"}
                </button>
                <Link href={`/admin/projects/${p.id}`} className={secondaryButtonClass}>Edit</Link>
                <ConfirmButton label="Delete" confirmLabel={`Delete ${p.slug}`} onConfirm={() => run(() => admin.deleteProject(p.id))} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
