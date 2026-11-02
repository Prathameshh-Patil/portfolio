import type { Experience } from "@/features/profile/profile";
import { Briefcase } from "@/components/ui/icons";

// Timeline of roles: a rail on the left with an icon per role, each role in its own card.
// `heading` keeps the page outline correct (see ProjectCard).
export function ExperienceList({ items, heading: Heading = "h3" }: { items: Experience[]; heading?: "h2" | "h3" }) {
  return (
    <ol className="relative space-y-6 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-border">
      {items.map((job) => (
        <li key={`${job.company}-${job.period}`} className="relative grid grid-cols-[40px_1fr] gap-4 sm:gap-6">
          <span
            aria-hidden="true"
            className="relative z-10 mt-5 grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-accent shadow-[var(--shadow-sm)]"
          >
            <Briefcase className="h-4 w-4" />
          </span>
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
              <div>
                <Heading className="text-lg font-semibold tracking-tight">{job.role}</Heading>
                <p className="text-muted">{job.company}</p>
              </div>
              <p className="rounded-full border border-border bg-surface-2/70 px-2.5 py-0.5 font-mono text-xs text-muted">{job.period}</p>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed">
              {job.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}
