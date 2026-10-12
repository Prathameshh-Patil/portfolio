import type { Experience } from "@/lib/profile";

// Vertical timeline: a left border with a dot per role.
export function ExperienceList({ items }: { items: Experience[] }) {
  return (
    <ol className="border-l border-border">
      {items.map((job) => (
        <li key={`${job.company}-${job.period}`} className="relative pb-10 pl-6 last:pb-0">
          <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent" aria-hidden="true" />
          <p className="font-mono text-xs text-muted">{job.period}</p>
          <h3 className="mt-1 font-semibold tracking-tight">{job.role}</h3>
          <p className="text-sm text-muted">{job.company}</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm leading-relaxed marker:text-border">
            {job.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
