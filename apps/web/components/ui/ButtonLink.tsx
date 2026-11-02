import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
  download?: boolean;
};

const base =
  "group inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 motion-safe:active:scale-[0.98]";
const variants = {
  // Primary: solid accent with a soft glow ring on hover.
  primary:
    "bg-accent text-accent-fg shadow-[inset_0_1px_0_0_rgb(255_255_255/0.2)] hover:bg-accent-hover hover:shadow-[0_0_0_4px_var(--accent-soft),0_8px_24px_-6px_var(--accent)]",
  // Secondary: translucent surface; border and text pick up the accent on hover.
  secondary:
    "border border-border bg-surface/60 text-text backdrop-blur-md hover:border-accent/50 hover:bg-surface hover:text-accent",
};

// A link styled as a button. External links open in a new tab; downloads use a plain <a>.
export function ButtonLink({ href, children, variant = "secondary", external, download }: Props) {
  const className = `${base} ${variants[variant]}`;
  if (external || download) {
    return (
      <a
        href={href}
        className={className}
        download={download || undefined}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {children}
        {external && <span className="sr-only">(opens in a new tab)</span>}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
