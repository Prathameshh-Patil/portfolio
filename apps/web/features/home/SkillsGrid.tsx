import { Brain, Code, Cpu, Database, Layout, Server } from "@/components/ui/icons";
import { skills } from "@/features/profile/profile";

// Bento grid of the skill groups from profile.ts. The two biggest groups take two columns.
const look: Record<string, { icon: (p: { className?: string }) => React.ReactNode; wide?: boolean; blurb: string }> = {
  Backend: { icon: Server, wide: true, blurb: "APIs, auth, background jobs and the rules that keep data correct." },
  "ML / AI": { icon: Brain, wide: true, blurb: "From classical baselines to fine-tuned models and agent workflows." },
  Languages: { icon: Code, blurb: "What I write every day." },
  Frontend: { icon: Layout, blurb: "Server-rendered, accessible interfaces." },
  "Data & Infrastructure": { icon: Database, blurb: "Storage, containers and pipelines." },
  "Core CS": { icon: Cpu, blurb: "The foundations." },
};

export function SkillsGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {skills.map(({ group, items }) => {
        const meta = look[group];
        const Icon = meta?.icon ?? Code;
        return (
          <li key={group} className={`card card-interactive reveal flex flex-col p-6 ${meta?.wide ? "lg:col-span-2" : ""}`}>
            <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-xl border border-accent/20 bg-accent-soft text-accent">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-semibold tracking-tight">{group}</h3>
            {meta?.blurb && <p className="mt-1 text-sm text-muted">{meta.blurb}</p>}
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`${group} skills`}>
              {items.map((item) => (
                <li key={item} className="rounded-lg border border-border bg-surface-2/70 px-2 py-1 text-xs">
                  {item}
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
