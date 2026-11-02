"use client";

import { useMemo, useState } from "react";
import type { Project } from "@portfolio/contracts";
import { ProjectCard } from "@/features/projects/ProjectCard";

// The projects page grid with filter chips built from the technologies the projects actually use.
// Rendered on the server first (all projects), so it works before JavaScript loads.
export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [tech, setTech] = useState<string | null>(null);

  // Technologies used by at least two projects, most common first: a short, useful list.
  const filters = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) for (const t of p.techStack) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([t]) => t);
  }, [projects]);

  const shown = tech ? projects.filter((p) => p.techStack.includes(tech)) : projects;
  const chip =
    "rounded-full border px-3.5 py-1.5 text-sm transition-colors aria-pressed:border-text aria-pressed:bg-text aria-pressed:text-bg";

  return (
    <>
      {filters.length > 0 && (
        <div role="group" aria-label="Filter by technology" className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={tech === null}
            onClick={() => setTech(null)}
            className={`${chip} border-border bg-surface text-muted hover:text-text`}
          >
            All <span className="ml-1 font-mono text-xs opacity-60">{projects.length}</span>
          </button>
          {filters.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tech === t}
              onClick={() => setTech(tech === t ? null : t)}
              className={`${chip} border-border bg-surface text-muted hover:text-text`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {tech ? `${shown.length} projects use ${tech}` : `${projects.length} projects`}
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {shown.map((project) => (
          <ProjectCard key={project.slug} project={project} heading="h2" />
        ))}
      </div>
    </>
  );
}
