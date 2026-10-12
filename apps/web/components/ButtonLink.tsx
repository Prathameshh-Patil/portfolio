import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
  download?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-medium transition-colors";
const variants = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  secondary: "border border-border bg-surface text-text hover:border-accent hover:text-accent",
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
        {external && <span aria-hidden="true">↗</span>}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
