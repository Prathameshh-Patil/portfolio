import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallToAction } from "@/components/ui/CallToAction";
import { Container } from "@/components/ui/Container";
import { ArrowRight, Briefcase, FileText, GraduationCap, MapPin } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkillsGrid } from "@/features/home/SkillsGrid";
import { education, profile } from "@/features/profile/profile";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <Container>
      <PageHeader label="About" title={`Hi, I'm ${profile.name.split(" ")[0]}.`} intro={profile.headline} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        <section aria-label="Bio" className="space-y-5 text-[17px] leading-[1.75] text-text/85">
          {profile.about.map((paragraph) => (
            <p key={paragraph.slice(0, 20)}>{paragraph}</p>
          ))}
          <div className="flex flex-wrap gap-3 pt-3">
            <ButtonLink href="/contact" variant="primary" size="lg">
              Get in touch <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/resume" size="lg">
              <FileText /> Resume
            </ButtonLink>
          </div>
        </section>

        <aside aria-label="At a glance" className="lg:sticky lg:top-24 lg:self-start">
          <div className="card overflow-hidden">
            <div className="relative isolate border-b border-border p-6">
              <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10" />
              <span
                aria-hidden="true"
                className="grid h-16 w-16 place-items-center rounded-2xl bg-text font-mono text-xl font-semibold text-bg shadow-[var(--shadow-md)]"
              >
                PP
              </span>
              <p className="mt-4 text-lg font-semibold tracking-tight">{profile.name}</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-accent">
                <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                {profile.availability}
              </p>
            </div>
            <dl className="divide-y divide-border text-sm">
              <div className="flex gap-3 p-5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
                <div>
                  <dt className="text-muted">Based in</dt>
                  <dd className="mt-0.5 font-medium">{profile.location}</dd>
                </div>
              </div>
              <div className="flex gap-3 p-5">
                <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
                <div>
                  <dt className="text-muted">Education · {education.period}</dt>
                  <dd className="mt-0.5 font-medium">{education.degree}</dd>
                  <dd className="text-muted">
                    {education.school} · {education.grade}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3 p-5">
                <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
                <div>
                  <dt className="text-muted">Open to</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {profile.openTo.map((role) => (
                      <Badge key={role} tone="accent">
                        {role}
                      </Badge>
                    ))}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <section className="mt-24" aria-labelledby="skills-heading">
        <SectionHeading id="skills-heading" label="Skills" title="What I work with" />
        <SkillsGrid />
      </section>

      <div className="mt-24">
        <CallToAction />
      </div>
    </Container>
  );
}
