import { CallToAction } from "@/components/ui/CallToAction";
import { Container } from "@/components/ui/Container";
import { GraduationCap } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExperienceList } from "@/features/profile/ExperienceList";
import { education, experience } from "@/features/profile/profile";

export const metadata = { title: "Experience" };

export default function ExperiencePage() {
  return (
    <Container>
      <PageHeader
        label="Experience"
        title="Where I've worked"
        intro="11 months of internships building backend services, LLM features and the infrastructure around them."
      />
      <div className="max-w-4xl">
        <ExperienceList items={experience} heading="h2" />

        <section aria-labelledby="education-heading" className="mt-16">
          <h2 id="education-heading" className="eyebrow">
            Education
          </h2>
          <div className="card mt-4 flex gap-5 p-6">
            <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface-2 text-accent">
              <GraduationCap className="h-4 w-4" />
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight">{education.degree}</p>
              <p className="text-muted">{education.school}</p>
              <p className="mt-2 font-mono text-xs text-muted">
                {education.period} · {education.grade}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-24">
        <CallToAction />
      </div>
    </Container>
  );
}
