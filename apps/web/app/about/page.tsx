import { ButtonLink } from "@/components/ButtonLink";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { education, profile, skills } from "@/lib/profile";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <Container className="max-w-3xl">
      <PageHeader label="About" title={`Hi, I'm ${profile.name.split(" ")[0]}.`} />

      {/* TODO: replace with a longer bio written by me. Only facts I've provided go here. */}
      <section className="space-y-4 leading-relaxed">
        <p>{profile.bio}</p>
        <p>
          I&apos;m based in {profile.location} and open to {profile.openTo.join(", ")} roles. {profile.availability}
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/resume" variant="primary">Resume</ButtonLink>
        <ButtonLink href="/contact">Get in touch</ButtonLink>
      </div>

      <section className="mt-16" aria-labelledby="skills-heading">
        <h2 id="skills-heading" className="text-xl font-semibold tracking-tight">Skills</h2>
        <dl className="mt-6 divide-y divide-border border-y border-border">
          {skills.map(({ group, items }) => (
            <div key={group} className="grid gap-2 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
              <dt className="font-mono text-xs uppercase tracking-widest text-muted sm:pt-0.5">{group}</dt>
              <dd className="text-sm leading-relaxed">{items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16" aria-labelledby="education-heading">
        <h2 id="education-heading" className="text-xl font-semibold tracking-tight">Education</h2>
        <div className="mt-6 rounded-lg border border-border bg-surface p-5">
          <p className="font-mono text-xs text-muted">{education.period}</p>
          <h3 className="mt-1 font-semibold tracking-tight">{education.degree}</h3>
          <p className="text-sm text-muted">{education.school}</p>
          <p className="mt-2 text-sm">{education.grade}</p>
        </div>
      </section>
    </Container>
  );
}
