import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { ArrowRight } from "@/components/ui/icons";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="relative isolate">
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10" />
      <Container className="flex flex-col items-center py-28 text-center sm:py-36">
        <p className="text-gradient font-mono text-7xl font-semibold tracking-tight sm:text-8xl">404</p>
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">This page doesn&apos;t exist.</h1>
        <p className="mt-4 max-w-md text-muted">The link may be old, or the address may have a typo.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="primary" size="lg">
            Go home
          </ButtonLink>
          <ButtonLink href="/projects" size="lg">
            See projects <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
