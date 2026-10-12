"use client";

import { useState } from "react";
import { resumes } from "@/lib/profile";

type Role = keyof typeof resumes;

// Native radio buttons styled as a segmented control: keyboard (arrow keys) and screen readers work for free.
export function ResumePicker() {
  const [role, setRole] = useState<Role>("sde");
  const selected = resumes[role];

  return (
    <div>
      <fieldset>
        <legend className="text-sm font-medium">Which role are you hiring for?</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(Object.keys(resumes) as Role[]).map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm transition-colors hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
            >
              <input
                type="radio"
                name="resume-role"
                value={key}
                checked={role === key}
                onChange={() => setRole(key)}
                className="accent-[var(--accent)] focus-visible:outline-none"
              />
              {resumes[key].label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={selected.file}
          download
          className="inline-flex items-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
        >
          Download {selected.label} resume (PDF)
        </a>
        <a
          href={selected.file}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
        >
          Open in new tab <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* Inline preview on larger screens only; mobile browsers handle embedded PDFs poorly. */}
      <iframe
        key={selected.file}
        src={selected.file}
        title={`${selected.label} resume preview`}
        className="mt-8 hidden h-[80vh] w-full rounded-lg border border-border bg-surface md:block"
      />
    </div>
  );
}
