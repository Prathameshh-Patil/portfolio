import Link from "next/link";
import type { Project } from "@/lib/api";

// The whole card is clickable via the title link stretched over it (after:absolute after:inset-0).
export function ProjectCard({ project }: { project: Pick<Project, "slug" | "title" | "summary" | "techStack"> }) {
  return (
    <article className="group relative flex flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent">
      <h3 className="font-semibold leading-snug tracking-tight">
        <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
          {project.title}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{project.summary}</p>
      <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tech stack">
        {project.techStack.map((tech) => (
          <li key={tech} className="rounded bg-accent-soft px-2 py-0.5 font-mono text-[11px] text-text">
            {tech}
          </li>
        ))}
      </ul>
    </article>
  );
}
