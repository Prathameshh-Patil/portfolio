// The top of every inner page: mono label, h1 and an optional intro line.
export function PageHeader({ label, title, intro }: { label: string; title: string; intro?: React.ReactNode }) {
  return (
    <header className="pb-10 pt-14 sm:pt-20">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{label}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {intro && <p className="mt-4 max-w-2xl leading-relaxed text-muted">{intro}</p>}
    </header>
  );
}
