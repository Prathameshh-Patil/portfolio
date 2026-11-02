import { Container } from "@/components/ui/Container";
import { ArrowUpRight, GitHub, LinkedIn, Mail } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/features/contact/ContactForm";
import { profile } from "@/features/profile/profile";

export const metadata = { title: "Contact" };

const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, icon: Mail },
  { label: "GitHub", value: "Prathameshh-Patil", href: profile.github, icon: GitHub },
  { label: "LinkedIn", value: "prathamesh-patil", href: profile.linkedin, icon: LinkedIn },
];

export default function ContactPage() {
  return (
    <Container>
      <PageHeader
        label="Contact"
        title="Let's talk"
        intro={`I'm open to ${profile.openTo.join(", ")} roles. ${profile.availability}`}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="card p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight">Send a message</h2>
          <p className="mt-1 text-sm text-muted">It goes straight to my inbox. I reply by email.</p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <aside aria-label="Other ways to reach me" className="space-y-4">
          <h2 className="eyebrow !text-subtle">Elsewhere</h2>
          <ul className="space-y-3">
            {links.map(({ label, value, href, icon: Icon }) => {
              const external = href.startsWith("http");
              return (
                <li key={label}>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="card card-interactive group flex items-center gap-4 p-4"
                  >
                    <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-text">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-muted">{label}</span>
                      <span className="block break-all text-sm font-medium">{value}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-subtle transition-colors group-hover:text-accent" />
                    {external && <span className="sr-only">(opens in a new tab)</span>}
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="rounded-2xl border border-dashed border-border-strong p-4 text-sm leading-relaxed text-muted">
            Based in {profile.location}. {profile.availability}
          </p>
        </aside>
      </div>
    </Container>
  );
}
