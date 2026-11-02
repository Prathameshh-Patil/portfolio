import Link from "next/link";
import type { Project } from "@portfolio/contracts";
import { TechList } from "@/components/ui/Badge";
import { ArrowRight, ArrowUpRight, GitHub } from "@/components/ui/icons";
import { projectHighlights, type ProjectHighlight } from "@/features/projects/highlights";

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
    <article className={`card card-interactive group relative flex h-full flex-col overflow-hidden ${wide ? "lg:flex-row" : ""}`}>
      {highlight && <Preview slug={project.slug} highlight={highlight} wide={wide} />}

      <div className={`flex flex-1 flex-col p-6 ${wide ? "lg:p-8" : ""}`}>
        {highlight?.status && (
          <p className="mb-3 w-fit rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted">{highlight.status}</p>
        )}
        <Heading className={`font-semibold leading-snug tracking-tight ${wide ? "text-2xl" : "text-xl"}`}>
          <Link
            href={`/projects/${project.slug}`}
            className="transition-colors after:absolute after:inset-0 after:rounded-[1rem] group-hover:text-accent"
          >
            {titleStart}
            {/* Last word and arrow can't be split, so the arrow never wraps onto a line by itself. */}
            <span className="whitespace-nowrap">
              {titleEnd}
              <ArrowUpRight className="ml-1.5 inline h-4 w-4 align-[-2px] text-subtle transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
            </span>
          </Link>
        </Heading>
        <p className="mt-3 leading-relaxed text-muted">{highlight?.tagline ?? project.summary}</p>

        <TechList items={project.techStack} className="mt-5" />

        <div className="mt-auto flex items-center justify-between pt-7 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-text transition-colors group-hover:text-accent" aria-hidden="true">
            Read case study <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 rounded-full border border-border p-2 text-muted transition-colors hover:border-accent/50 hover:text-text"
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

// The card's visual: the project's pipeline and one real, sourced result, on a tinted grid.
function Preview({ slug, highlight, wide }: { slug: string; highlight: ProjectHighlight; wide: boolean }) {
  return (
    <div
      className={`relative isolate flex flex-col justify-between gap-8 overflow-hidden border-b border-border bg-surface-2/60 p-6 ${
        wide ? "lg:order-last lg:w-[48%] lg:border-b-0 lg:border-l lg:p-8" : ""
      }`}
    >
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-70" />
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,var(--glow-1),transparent_70%)] transition-transform duration-700 group-hover:scale-125"
      />
      <p className="font-mono text-[11px] text-subtle" aria-hidden="true">
        ~/{slug}
      </p>
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]" aria-label="Pipeline">
        {highlight.flow.map((step, i) => (
          <li key={step} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-subtle" aria-hidden="true">→</span>}
            <span className="rounded-md border border-border bg-surface px-2 py-1 text-text shadow-[var(--shadow-sm)]">{step}</span>
          </li>
        ))}
      </ol>
      <p className="flex flex-col gap-1">
        <span className="text-gradient w-fit text-4xl font-semibold tracking-tight">{highlight.metric.value}</span>
        <span className="max-w-xs text-sm leading-snug text-muted">{highlight.metric.label}</span>
      </p>
    </div>
  );
}
