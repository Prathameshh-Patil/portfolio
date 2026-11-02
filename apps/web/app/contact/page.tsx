import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/features/contact/ContactForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { profile } from "@/features/profile/profile";

export const metadata = { title: "Contact" };

const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "GitHub", value: "Prathameshh-Patil", href: profile.github },
  { label: "LinkedIn", value: "prathamesh-patil", href: profile.linkedin },
];

export default function ContactPage() {
  return (
    <Container>
      <PageHeader
        label="Contact"
        title="Get in touch"
        intro={`I'm open to ${profile.openTo.join(", ")} roles. ${profile.availability}`}
      />
      <div className="grid gap-12 md:grid-cols-[1fr_260px]">
        <ContactForm />
        <aside aria-label="Other ways to reach me">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">Elsewhere</h2>
          <ul className="mt-4 space-y-4">
            {links.map((link) => (
              <li key={link.label}>
                <p className="text-sm text-muted">{link.label}</p>
                <a
                  href={link.href}
                  className="break-all text-sm font-medium hover:text-accent"
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {link.value}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Container>
  );
}
