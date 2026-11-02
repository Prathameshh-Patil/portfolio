// A small rounded label: tech stack items, statuses, filters.
export function Badge({ children, tone = "neutral", className = "" }: { children: React.ReactNode; tone?: "neutral" | "accent"; className?: string }) {
  const tones = {
    neutral: "border-border bg-surface-2/70 text-muted",
    accent: "border-accent/25 bg-accent-soft text-accent",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] leading-5 ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

// A list of tech badges with an accessible name.
export function TechList({ items, label = "Tech stack", className = "" }: { items: string[]; label?: string; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label={label}>
      {items.map((item) => (
        <li key={item}>
          <Badge>{item}</Badge>
        </li>
      ))}
    </ul>
  );
}
