import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { ExperienceList } from "@/features/profile/ExperienceList";
import { HeroBackdrop } from "@/components/layout/HeroBackdrop";
import { Download, GitHub, LinkedIn, Mail } from "@/components/ui/icons";
import { ProjectCard } from "@/features/projects/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Project } from "@portfolio/contracts";
import { getProjects } from "@/features/projects/api";
import { coreStack, education, experience, profile, resumeFile } from "@/features/profile/profile";

// Staggered entrance: each block fades up a little after the previous one. The animation class is
// motion-safe:, so people who ask for reduced motion see everything immediately.
const FADE = "motion-safe:animate-fade-up";
const delay = (step: number) => ({ animationDelay: `${step * 70}ms` });

export default async function HomePage() {
  // If the API is down, the rest of the page still renders; only this section shows an error.
  let featured: Project[] | null = null;
  try {
    featured = (await getProjects()).filter((p) => p.featured).slice(0, 3);
  } catch {
    featured = null;
  }

  const facts = [
    `B.E. AI & ML, DSATM · ${education.period} · ${education.grade}`,
    "11 months of internships building backend and LLM services",
    `Open to ${profile.openTo.join(", ")} roles`,
  ];

  return (
    <>
      <section className="relative isolate">
        <HeroBackdrop />
        <Container className="pb-16 pt-16 sm:pb-20 sm:pt-24">
          <div className={FADE} style={delay(0)}>
            <StatusPill>
              Available to join immediately · {profile.city}
            </StatusPill>
          </div>

          <h1
            className={`${FADE} mt-7 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl`} style={delay(1)}
          >
            <span className="text-gradient">Full-stack engineer who builds </span>
            <span className="text-gradient-accent">AI-backed products</span>
            <span className="text-gradient">, from database to deployed app.</span>
          </h1>

          <p className={`${FADE} mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl`} style={delay(2)}>
            {profile.summary}
          </p>

          <ul className={`${FADE} mt-6 flex max-w-3xl flex-col gap-2 text-sm text-muted sm:flex-row sm:flex-wrap sm:gap-x-6`} style={delay(3)}>
            {facts.map((fact) => (
              <li key={fact} className="flex items-start gap-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                {fact}
              </li>
            ))}
          </ul>

          <div className={`${FADE} mt-8 flex flex-wrap gap-3`} style={delay(4)}>
            <ButtonLink href={resumeFile} variant="primary" download>
              <Download /> Download resume
            </ButtonLink>
            <ButtonLink href={profile.github} external>
              <GitHub /> GitHub
            </ButtonLink>
            <ButtonLink href={profile.linkedin} external>
              <LinkedIn /> LinkedIn
            </ButtonLink>
            <ButtonLink href="/contact">
              <Mail /> Contact
            </ButtonLink>
          </div>

          <div className={`${FADE} mt-12 border-t border-border pt-6`} style={delay(5)}>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Core stack</p>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Core stack">
              {coreStack.map((tech) => (
                <li key={tech} className="rounded-md border border-border bg-surface/50 px-2.5 py-1 font-mono text-xs backdrop-blur-md">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16" aria-labelledby="featured-heading">
        <Container>
          <SectionHeading id="featured-heading" label="Selected work" title="Featured projects" href="/projects" linkText="All projects" />
          {featured ? (
            // Bento layout: the first project spans the full width, the next two sit side by side.
            <div className="grid gap-4 md:grid-cols-2">
              {featured.map((project, i) => (
                <div key={project.slug} className={i === 0 ? "md:col-span-2" : ""}>
                  <ProjectCard project={project} wide={i === 0} />
                </div>
              ))}
            </div>
          ) : (
            <ApiErrorNotice what="projects" />
          )}
        </Container>
      </section>

      <section className="py-12 sm:py-16" aria-labelledby="experience-heading">
        <Container>
          <SectionHeading id="experience-heading" label="Experience" title="Where I've worked" href="/experience" linkText="Details" />
          <ExperienceList items={experience} />
        </Container>
      </section>
    </>
  );
}
