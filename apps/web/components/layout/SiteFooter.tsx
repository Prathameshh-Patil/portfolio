import Link from "next/link";
import { profile, siteRepo } from "@/features/profile/profile";
import { Container } from "@/components/ui/Container";

const pages = [
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

const elsewhere = [
  { href: `mailto:${profile.email}`, label: "Email" },
  { href: profile.github, label: "GitHub" },
  { href: profile.linkedin, label: "LinkedIn" },
];

const linkClass = "text-sm text-muted transition-colors hover:text-text";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/40">
      <Container className="grid gap-10 py-14 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-lg bg-text font-mono text-xs font-semibold text-bg">
              PP
            </span>
            <span className="font-medium tracking-tight">{profile.name}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{profile.headline}</p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            {profile.availability}
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="eyebrow !text-subtle">Pages</h2>
          <ul className="mt-4 space-y-2.5">
            {pages.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className={linkClass}>
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow !text-subtle">Elsewhere</h2>
          <ul className="mt-4 space-y-2.5">
            {elsewhere.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className={linkClass}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col gap-2 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {profile.name} · {profile.location}
          </p>
          <p>
            Built with Next.js, Express and MySQL ·{" "}
            <a href={siteRepo} target="_blank" rel="noopener noreferrer" className="underline decoration-border-strong underline-offset-2 hover:text-text">
              Source on GitHub
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}
