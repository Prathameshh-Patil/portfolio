import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";

// Eyebrow label + heading + optional intro, with an optional "see all" link on the right.
export function SectionHeading({
  id,
  label,
  title,
  intro,
  href,
  linkText,
}: {
  id?: string;
  label: string;
  title: string;
  intro?: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow">{label}</p>
        <h2 id={id} className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          {title}
        </h2>
        {intro && <p className="mt-3 leading-relaxed text-muted">{intro}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-accent">
          {linkText}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
