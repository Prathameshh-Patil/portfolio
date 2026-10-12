"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { publicationFormSchema, publicationStatuses } from "@/lib/admin-schemas";
import { admin, ApiError, type Publication } from "@/lib/api";
import { statusLabels } from "@/lib/publications";
import { errorMessage } from "@/lib/use-admin";
import { Field, FormError, fieldProps, firstErrors, primaryButtonClass } from "../form";
import { EditLoader } from "./EditLoader";

export function PublicationForm({ publication, nextSortOrder = 0 }: { publication?: Publication; nextSortOrder?: number }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "");
    const parsed = publicationFormSchema.safeParse({
      title: text("title"),
      authors: text("authors"),
      venue: text("venue"),
      year: text("year"),
      status: text("status"),
      url: text("url"),
      summary: text("summary"),
      visible: form.get("visible") === "on",
      sortOrder: text("sortOrder") || "0",
    });
    if (!parsed.success) {
      setErrors(firstErrors(z.flattenError(parsed.error).fieldErrors));
      return;
    }

    setErrors({});
    setFormError("");
    setSaving(true);
    try {
      if (publication) await admin.updatePublication(publication.id, parsed.data);
      else await admin.createPublication(parsed.data);
      router.push("/admin/publications");
    } catch (err) {
      setSaving(false);
      if (err instanceof ApiError && err.status === 400 && err.details) setErrors(firstErrors(err.details));
      else setFormError(errorMessage(err));
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-sm">
        <Link href="/admin/publications" className="text-muted hover:text-accent">← Publications</Link>
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">{publication ? "Edit publication" : "New publication"}</h1>

      <form onSubmit={handleSubmit} method="post" noValidate className="mt-8 space-y-5">
        <Field name="title" label="Title" error={errors.title}>
          <input type="text" defaultValue={publication?.title} maxLength={300} {...fieldProps("title", errors.title)} />
        </Field>
        <Field name="authors" label="Authors" hint="(as they appear on the paper)" error={errors.authors}>
          <input type="text" defaultValue={publication?.authors} maxLength={1000} {...fieldProps("authors", errors.authors)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
          <Field name="venue" label="Venue" hint="(optional)" error={errors.venue}>
            <input type="text" defaultValue={publication?.venue ?? ""} maxLength={200} {...fieldProps("venue", errors.venue)} />
          </Field>
          <Field name="year" label="Year" hint="(optional)" error={errors.year}>
            <input type="number" inputMode="numeric" defaultValue={publication?.year ?? ""} {...fieldProps("year", errors.year)} />
          </Field>
        </div>
        <Field name="status" label="Status" error={errors.status}>
          <select defaultValue={publication?.status ?? "published"} {...fieldProps("status", errors.status)}>
            {publicationStatuses.map((s) => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
        </Field>
        <Field name="url" label="Link" hint="(optional: DOI, arXiv, IEEE…)" error={errors.url}>
          <input type="url" defaultValue={publication?.url ?? ""} {...fieldProps("url", errors.url)} />
        </Field>
        <Field name="summary" label="Summary" hint="(two lines, plain English)" error={errors.summary}>
          <textarea rows={3} defaultValue={publication?.summary} maxLength={2000} {...fieldProps("summary", errors.summary)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="sortOrder" label="Order" hint="(lower comes first)" error={errors.sortOrder}>
            <input type="number" defaultValue={publication?.sortOrder ?? nextSortOrder} {...fieldProps("sortOrder", errors.sortOrder)} />
          </Field>
          <label className="flex items-center gap-2 self-end pb-3 text-sm">
            <input type="checkbox" name="visible" defaultChecked={publication?.visible ?? true} className="h-4 w-4 accent-[var(--accent)]" />
            Visible on the site
          </label>
        </div>

        <FormError message={formError} />
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? "Saving…" : publication ? "Save changes" : "Create publication"}
        </button>
      </form>
    </div>
  );
}

export function PublicationEditor({ id }: { id?: number }) {
  return (
    <EditLoader load={admin.publications} id={id}>
      {(publication, nextSortOrder) => <PublicationForm publication={publication} nextSortOrder={nextSortOrder} />}
    </EditLoader>
  );
}
