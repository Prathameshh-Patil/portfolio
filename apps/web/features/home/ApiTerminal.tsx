import type { Project } from "@portfolio/contracts";
import { ArrowUpRight } from "@/components/ui/icons";
import { publicApiUrl } from "@/lib/env";

// The hero's visual: a terminal showing a real request to this site's API and the JSON it returned
// for this very page render. If the API is down, it says so instead of showing made-up data.
export function ApiTerminal({ projects }: { projects: Project[] | null }) {
  const host = new URL(publicApiUrl).host;
  const sample = projects?.slice(0, 3) ?? [];

  return (
    <figure className="relative">
      {/* Soft coloured glow behind the window */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(60%_60%_at_70%_30%,var(--glow-1),transparent_70%),radial-gradient(50%_50%_at_20%_80%,var(--glow-2),transparent_70%)] blur-2xl"
      />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--code-bg)] font-mono text-[12.5px] leading-6 text-[var(--code-text)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 truncate text-xs text-[var(--code-muted)]">zsh · {host}</span>
        </div>

        <div className="overflow-x-auto px-4 py-4 sm:px-5">
          <p className="whitespace-nowrap">
            <span className="text-[var(--code-key)]">$</span> curl -s {host}/api/projects <span className="text-[var(--code-muted)]">| jq</span>
          </p>

          {projects ? (
            <pre className="mt-2 text-[var(--code-text)]">
              <span className="text-[var(--code-muted)]">[</span>
              {"\n"}
              {sample.map((p, i) => (
                <span key={p.slug}>
                  {"  "}
                  <span className="text-[var(--code-muted)]">{"{"}</span>
                  {"\n    "}
                  <Key>slug</Key>: <Str>{p.slug}</Str>,{"\n    "}
                  <Key>title</Key>: <Str>{shorten(p.title)}</Str>,{"\n    "}
                  <Key>views</Key>: <span className="text-[var(--code-number)]">{p.views}</span>
                  {"\n  "}
                  <span className="text-[var(--code-muted)]">{"}"}</span>
                  {i < sample.length - 1 ? "," : ""}
                  {"\n"}
                </span>
              ))}
              <span className="text-[var(--code-muted)]">]</span>
            </pre>
          ) : (
            <p className="mt-2 text-[#ff7b72]">curl: (7) Failed to connect: the API isn&apos;t responding right now</p>
          )}

          <p className="mt-3 whitespace-nowrap">
            <span className="text-[var(--code-key)]">$</span> <span className="caret inline-block h-4 w-2 translate-y-0.5 bg-[var(--code-text)]" aria-hidden="true" />
          </p>
        </div>
      </div>
      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Real response from this site&apos;s API, fetched for this page
        </span>
        <a
          href={`${publicApiUrl}/docs`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-text transition-colors hover:text-accent"
        >
          API docs <ArrowUpRight className="h-3.5 w-3.5" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </figcaption>
    </figure>
  );
}

const Key = ({ children }: { children: React.ReactNode }) => <span className="text-[var(--code-key)]">&quot;{children}&quot;</span>;
const Str = ({ children }: { children: React.ReactNode }) => <span className="text-[var(--code-string)]">&quot;{children}&quot;</span>;

// Keeps the JSON lines short enough for the window.
const shorten = (title: string) => (title.length > 30 ? `${title.split(":")[0]}` : title);
