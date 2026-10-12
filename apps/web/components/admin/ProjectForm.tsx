"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { admin, ApiError, type Project } from "@/lib/api";
import { projectFormSchema } from "@/lib/admin-schemas";
import { errorMessage } from "@/lib/use-admin";
import { Field, FormError, fieldProps, firstErrors, primaryButtonClass } from "../form";
import { EditLoader } from "./EditLoader";

// One form for both "new" and "edit". Inputs are uncontrolled (defaultValue), read with FormData on submit.
export function ProjectForm({ project, nextSortOrder = 0 }: { project?: Project; nextSortOrder?: number }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = projectFormSchema.safeParse({
      slug: String(form.get("slug") ?? ""),
      title: String(form.get("title") ?? ""),
      summary: String(form.get("summary") ?? ""),
      techStack: String(form.get("techStack") ?? ""),
      repoUrl: String(form.get("repoUrl") ?? ""),
      demoUrl: String(form.get("demoUrl") ?? ""),
      featured: form.get("featured") === "on",
      published: form.get("published") === "on",
    });
    if (!parsed.success) {
      setErrors(firstErrors(z.flattenError(parsed.error).fieldErrors));
      return;
    }

    setErrors({});
    setFormError("");
    setSaving(true);
    try {
      const data = { ...parsed.data, sortOrder: project?.sortOrder ?? nextSortOrder };
      if (project) await admin.updateProject(project.id, data);
      else await admin.createProject(data);
      router.push("/admin/projects");
    } catch (err) {
      setSaving(false);
      if (err instanceof ApiError && err.status === 409) setErrors({ slug: "Another project already uses this slug." });
      else if (err instanceof ApiError && err.status === 400 && err.details) setErrors(firstErrors(err.details));
      else setFormError(errorMessage(err));
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-sm">
        <Link href="/admin/projects" className="text-muted hover:text-accent">← Projects</Link>
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">{project ? `Edit ${project.title}` : "New project"}</h1>

      <form onSubmit={handleSubmit} method="post" noValidate className="mt-8 space-y-5">
        <Field name="title" label="Title" error={errors.title}>
          <input type="text" defaultValue={project?.title} maxLength={120} {...fieldProps("title", errors.title)} />
        </Field>
        <Field name="slug" label="Slug" hint="(page URL; the case study file is content/projects/<slug>.mdx)" error={errors.slug}>
          <input type="text" defaultValue={project?.slug} maxLength={80} spellCheck={false} {...fieldProps("slug", errors.slug)} />
        </Field>
        <Field name="summary" label="Summary" error={errors.summary}>
          <textarea rows={4} defaultValue={project?.summary} maxLength={2000} {...fieldProps("summary", errors.summary)} />
        </Field>
        <Field name="techStack" label="Tech stack" hint="(comma-separated)" error={errors.techStack}>
          <input type="text" defaultValue={project?.techStack.join(", ")} {...fieldProps("techStack", errors.techStack)} />
        </Field>
        <Field name="repoUrl" label="Repository URL" hint="(optional)" error={errors.repoUrl}>
          <input type="url" defaultValue={project?.repoUrl ?? ""} {...fieldProps("repoUrl", errors.repoUrl)} />
        </Field>
        <Field name="demoUrl" label="Demo URL" hint="(optional; leave empty unless a working demo exists)" error={errors.demoUrl}>
          <input type="url" defaultValue={project?.demoUrl ?? ""} {...fieldProps("demoUrl", errors.demoUrl)} />
        </Field>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Visibility</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={project?.featured ?? false} className="h-4 w-4 accent-[var(--accent)]" />
            Featured (shown on the home page)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={project?.published ?? true} className="h-4 w-4 accent-[var(--accent)]" />
            Published (unchecked = draft, hidden from the site)
          </label>
        </fieldset>

        <FormError message={formError} />
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? "Saving…" : project ? "Save changes" : "Create project"}
        </button>
      </form>
    </div>
  );
}

// Used by the /admin/projects/new and /admin/projects/[id] pages (which are Server Components).
export function ProjectEditor({ id }: { id?: number }) {
  return (
    <EditLoader load={admin.projects} id={id}>
      {(project, nextSortOrder) => <ProjectForm project={project} nextSortOrder={nextSortOrder} />}
    </EditLoader>
  );
}
