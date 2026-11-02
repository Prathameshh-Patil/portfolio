// The top of every inner page: eyebrow label, a large h1 and an optional intro, over a faint grid.
export function PageHeader({ label, title, intro, children }: { label: string; title: string; intro?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="relative isolate pb-12 pt-16 sm:pb-16 sm:pt-24">
      <div aria-hidden="true" className="bg-grid absolute inset-x-0 -top-16 -z-10 h-80" />
      <p className="eyebrow motion-safe:animate-fade-up">{label}</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.03em] motion-safe:animate-fade-up sm:text-5xl" style={{ animationDelay: "60ms" }}>
        {title}
      </h1>
      {intro && (
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted motion-safe:animate-fade-up" style={{ animationDelay: "120ms" }}>
          {intro}
        </p>
      )}
      {children}
    </header>
  );
}
