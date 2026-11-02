import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "inverse" | "inverse-outline";
  size?: "md" | "lg";
  external?: boolean;
  download?: boolean;
  className?: string;
};

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 motion-safe:active:scale-[0.98]";
const sizes = { md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm sm:text-[15px]" };
const variants = {
  // Primary: solid near-black (light) / near-white (dark), the accent glows on hover.
  primary:
    "bg-text text-bg shadow-[var(--shadow-sm)] hover:bg-accent hover:text-accent-fg hover:shadow-[0_0_0_4px_var(--accent-soft),0_10px_28px_-10px_var(--accent)]",
  // Secondary: surface with a hairline border that picks up the accent on hover.
  secondary: "border border-border bg-surface text-text shadow-[var(--shadow-sm)] hover:border-accent/50 hover:text-accent",
  ghost: "text-muted hover:bg-surface-2 hover:text-text",
  // For dark bands (CallToAction): the colours flip.
  inverse: "bg-bg text-text hover:bg-accent hover:text-accent-fg",
  "inverse-outline": "border border-bg/25 text-bg hover:border-bg/60 hover:bg-bg/10",
};

export const buttonClass = (variant: Props["variant"] = "secondary", size: Props["size"] = "md") =>
  `${base} ${sizes[size]} ${variants[variant]}`;

// A link styled as a button. External links open in a new tab; downloads use a plain <a>.
export function ButtonLink({ href, children, variant = "secondary", size = "md", external, download, className = "" }: Props) {
  const classes = `${buttonClass(variant, size)} ${className}`;
  if (external || download) {
    return (
      <a
        href={href}
        className={classes}
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
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
