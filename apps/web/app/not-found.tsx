import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Container className="py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">This page doesn&apos;t exist.</h1>
      <p className="mt-4 text-muted">The link may be old, or the address may have a typo.</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/" variant="primary">Go home</ButtonLink>
        <ButtonLink href="/projects">See projects</ButtonLink>
      </div>
    </Container>
  );
}
