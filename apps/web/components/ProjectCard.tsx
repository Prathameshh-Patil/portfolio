import Link from "next/link";
import type { Project } from "@/lib/api";
import { projectHighlights, type ProjectHighlight } from "@/lib/project-highlights";
import { ArrowRight, ArrowUpRight, GitHub } from "./icons";

type CardProject = Pick<Project, "slug" | "title" | "summary" | "techStack" | "repoUrl">;

// `heading` keeps the outline correct: h3 under a section's h2 (home page), h2 directly under the page's h1.
// The whole card opens the case study: the title link is stretched over the card (after:absolute
// after:inset-0). The GitHub link sits above that layer (relative z-10) so it stays separately clickable.
export function ProjectCard({ project, wide = false, heading: Heading = "h3" }: { project: CardProject; wide?: boolean; heading?: "h2" | "h3" }) {
  const highlight = projectHighlights[project.slug];
  const splitAt = project.title.lastIndexOf(" ") + 1;
  const titleStart = project.title.slice(0, splitAt);
  const titleEnd = project.title.slice(splitAt);

  return (
    <article
      className={`card group relative flex flex-col gap-6 p-5 transition-all duration-300 hover:border-accent/40 focus-within:border-accent/60 hover:shadow-[inset_0_1px_0_0_var(--highlight),0_20px_40px_-20px_var(--accent)] motion-safe:hover:-translate-y-1 sm:p-6 ${
        wide ? "lg:flex-row lg:items-stretch lg:gap-8" : ""
      }`}
    >
      {highlight && <Preview slug={project.slug} highlight={highlight} wide={wide} />}

      <div className="flex flex-1 flex-col">
        {highlight?.status && (
          <p className="mb-3 w-fit rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted">{highlight.status}</p>
        )}
        <Heading className={`font-semibold leading-snug tracking-tight ${wide ? "text-xl" : "text-lg"}`}>
          <Link href={`/projects/${project.slug}`} className="transition-colors after:absolute after:inset-0 after:rounded-[0.875rem] group-hover:text-accent">
            {titleStart}
            {/* Last word and arrow can't be split, so the arrow never wraps onto a line by itself. */}
            <span className="whitespace-nowrap">
              {titleEnd}
              <ArrowUpRight className="ml-1.5 inline h-4 w-4 align-[-2px] text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
            </span>
          </Link>
        </Heading>
        <p className="mt-2 text-sm leading-relaxed text-muted">{highlight?.tagline ?? project.summary}</p>

        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {project.techStack.map((tech) => (
            <li key={tech} className="rounded-full border border-border bg-bg/60 px-2.5 py-0.5 font-mono text-[11px] text-muted">
              {tech}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between pt-6 text-sm">
          <span className="inline-flex items-center gap-1.5 text-muted transition-colors group-hover:text-accent" aria-hidden="true">
            Read case study <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 rounded-md p-1.5 text-muted transition-colors hover:bg-accent-soft hover:text-text"
            >
              <GitHub />
              <span className="sr-only">{project.title} on GitHub (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

// A small "window" showing the project's pipeline and one real result, so each card has a visual anchor.
function Preview({ slug, highlight, wide }: { slug: string; highlight: ProjectHighlight; wide: boolean }) {
  return (
    <div className={`flex flex-col rounded-lg border border-border bg-bg/70 font-mono text-[11px] ${wide ? "lg:order-last lg:w-[46%]" : ""}`}>
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="ml-2 truncate text-muted">{slug}</span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-3 sm:p-4">
        <ol className="flex flex-wrap items-center gap-1.5" aria-label="Pipeline">
          {highlight.flow.map((step, i) => (
            <li key={step} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-muted/60" aria-hidden="true">→</span>}
              <span className="rounded border border-border bg-surface px-1.5 py-0.5 text-text">{step}</span>
            </li>
          ))}
        </ol>
        <p className="flex items-baseline gap-2.5 border-t border-dashed border-border pt-3">
          <span className="text-gradient-accent shrink-0 whitespace-nowrap font-sans text-2xl font-semibold tracking-tight">{highlight.metric.value}</span>
          <span className="leading-snug text-muted">{highlight.metric.label}</span>
        </p>
      </div>
    </div>
  );
}
