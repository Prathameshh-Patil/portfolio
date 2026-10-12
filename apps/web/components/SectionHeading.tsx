import Link from "next/link";

// Small mono label + heading, with an optional "see all" link on the right.
export function SectionHeading({ label, title, href, linkText }: { label: string; title: string; href?: string; linkText?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{label}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm text-muted transition-colors hover:text-accent">
          {linkText} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
