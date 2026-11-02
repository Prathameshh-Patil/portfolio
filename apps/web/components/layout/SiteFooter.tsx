import { profile } from "@/features/profile/profile";
import { Container } from "@/components/ui/Container";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <Container className="flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          {profile.name} · {profile.location}
        </p>
        <ul className="flex gap-5">
          <li>
            <a className="hover:text-accent" href={`mailto:${profile.email}`}>Email</a>
          </li>
          <li>
            <a className="hover:text-accent" href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          </li>
          <li>
            <a className="hover:text-accent" href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </li>
        </ul>
      </Container>
    </footer>
  );
}
