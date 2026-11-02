import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowUpRight, Cloud, Database, GitHub, Layout, Server } from "@/components/ui/icons";
import { siteRepo } from "@/features/profile/profile";
import { publicApiUrl } from "@/lib/env";

// This site as a project: the four parts of its stack, left to right in the order a request travels.
const steps = [
  {
    icon: Layout,
    name: "Next.js website",
    points: ["Server-rendered pages", "Feature folders, typed API client", "13 Playwright browser tests"],
  },
  {
    icon: Server,
    name: "Express API",
    points: ["Node.js + TypeScript", "Routes → services → repositories", "OpenAPI 3.1 docs from Zod"],
  },
  {
    icon: Database,
    name: "MySQL 8.4",
    points: ["Transactions for exact counts", "Indexes: up to 149× faster", "Migrations in version control"],
  },
  {
    icon: Cloud,
    name: "AWS",
    points: ["Lambda + API Gateway", "RDS MySQL, TLS required", "One SAM template"],
  },
];

export function HowItsBuilt() {
  return (
    <div className="card relative isolate overflow-hidden p-6 sm:p-10">
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10" />
      <ol className="grid gap-4 md:grid-cols-4 md:gap-0">
        {steps.map(({ icon: Icon, name, points }, i) => (
          <li key={name} className="relative md:px-5 md:first:pl-0 md:last:pr-0">
            {/* Connector between steps (desktop): the request flows left to right. */}
            {i > 0 && (
              <span aria-hidden="true" className="absolute -left-2 top-5 hidden h-px w-4 bg-border-strong md:block" />
            )}
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-text text-bg">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold tracking-tight">{name}</h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {p}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
        <ButtonLink href={`${publicApiUrl}/docs`} external>
          Explore the API docs <ArrowUpRight />
        </ButtonLink>
        <ButtonLink href={siteRepo} external variant="ghost">
          <GitHub /> Read the source
        </ButtonLink>
      </div>
    </div>
  );
}
