import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";

// "Available" badge at the top of the hero. The dot only pulses for people who haven't asked for reduced motion.
export function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/contact"
      className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/50 py-1 pl-3 pr-2.5 text-xs text-muted backdrop-blur-md transition-colors hover:border-accent/50 hover:text-text"
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      {children}
      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
