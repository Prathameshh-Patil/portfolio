import Link from "next/link";
import type { Project } from "@portfolio/contracts";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallToAction } from "@/components/ui/CallToAction";
import { Container } from "@/components/ui/Container";
import { ArrowRight, Briefcase, Download, GitHub, GraduationCap, LinkedIn, MapPin } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ApiTerminal } from "@/features/home/ApiTerminal";
import { HowItsBuilt } from "@/features/home/HowItsBuilt";
import { SkillsGrid } from "@/features/home/SkillsGrid";
import { ExperienceList } from "@/features/profile/ExperienceList";
import { coreStack, education, experience, profile, resumeFile } from "@/features/profile/profile";
import { getProjects } from "@/features/projects/api";
import { ProjectCard } from "@/features/projects/ProjectCard";

// Staggered entrance: each block fades up a little after the previous one. The animation class is
// motion-safe:, so people who ask for reduced motion see everything immediately.
const FADE = "motion-safe:animate-fade-up";
const delay = (step: number) => ({ animationDelay: `${step * 80}ms` });

export default async function HomePage() {
  // If the API is down, the rest of the page still renders; only the API-backed parts show an error.
  let projects: Project[] | null = null;
  try {
    projects = await getProjects();
  } catch {
    projects = null;
  }
  const featured = projects?.filter((p) => p.featured).slice(0, 3) ?? null;

  const facts = [
    { icon: MapPin, text: profile.city },
    { icon: GraduationCap, text: `B.E. AI & ML · ${education.grade}` },
    { icon: Briefcase, text: "11 months of internships" },
  ];

  // Every number here is sourced: internships in profile.ts, tests and benchmark in this repo.
  const stats = [
    { value: "11 mo", label: "internship experience in backend and AI" },
    ...(projects ? [{ value: String(projects.length), label: "projects with full case studies" }] : []),
    { value: "149×", label: "faster inbox query after indexing this site's MySQL" },
    { value: "46", label: "automated tests run on every push to this site" },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10" />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 -z-10 h-[520px] w-[1100px] -translate-x-1/2 bg-[radial-gradient(closest-side,var(--glow-1),transparent)]"
        />
        <Container className="grid items-center gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pb-28 lg:pt-24">
          <div className="min-w-0">
            <div className={FADE} style={delay(0)}>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/70 py-1 pl-2 pr-3 text-xs text-muted shadow-[var(--shadow-sm)] backdrop-blur transition-colors hover:border-accent/50 hover:text-text"
              >
                <span className="rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent">Open to work</span>
                Available to join immediately
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <h1
              className={`${FADE} mt-7 text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[3.4rem] xl:text-[3.75rem]`}
              style={delay(1)}
            >
              Full-stack engineer who builds <span className="text-gradient">AI‑backed products</span>, from database to deployed app.
            </h1>

            <p className={`${FADE} mt-6 max-w-xl text-lg leading-relaxed text-muted`} style={delay(2)}>
              {profile.summary}
            </p>

            <div className={`${FADE} mt-8 flex flex-wrap items-center gap-3`} style={delay(3)}>
              <ButtonLink href="/projects" variant="primary" size="lg">
                See my work <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href={resumeFile} size="lg" download>
                <Download /> Resume
              </ButtonLink>
              <div className="flex items-center gap-1">
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full p-2.5 text-muted transition-colors hover:bg-surface-2 hover:text-text"
                >
                  <GitHub className="h-5 w-5" />
                  <span className="sr-only">GitHub (opens in a new tab)</span>
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full p-2.5 text-muted transition-colors hover:bg-surface-2 hover:text-text"
                >
                  <LinkedIn className="h-5 w-5" />
                  <span className="sr-only">LinkedIn (opens in a new tab)</span>
                </a>
              </div>
            </div>

            <ul className={`${FADE} mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted`} style={delay(4)}>
              {facts.map(({ icon: Icon, text }) => (
                <li key={text} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-subtle" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className={`${FADE} min-w-0`} style={delay(3)}>
            <ApiTerminal projects={projects} />
          </div>
        </Container>

        <Container>
          <div className={`${FADE} flex flex-col gap-3 border-t border-border py-6 sm:flex-row sm:items-center sm:gap-6`} style={delay(5)}>
            <p className="eyebrow shrink-0 !text-subtle">Core stack</p>
            <ul className="flex flex-wrap gap-2" aria-label="Core stack">
              {coreStack.map((tech) => (
                <li key={tech} className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium shadow-[var(--shadow-sm)]">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section aria-label="Highlights" className="py-10">
        <Container>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="reveal bg-surface p-6 sm:p-7">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block text-3xl font-semibold tracking-tight sm:text-4xl">{s.value}</span>
                  <span className="mt-2 block text-sm leading-snug text-muted">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="featured-heading">
        <Container>
          <SectionHeading
            id="featured-heading"
            label="Selected work"
            title="Featured projects"
            intro="Real systems with measured results: concurrency guarantees, evaluated models and a human in the loop."
            href="/projects"
            linkText="All projects"
          />
          {featured ? (
            // Bento layout: the first project spans the full width, the next two sit side by side.
            <div className="grid gap-5 md:grid-cols-2">
              {featured.map((project, i) => (
                <div key={project.slug} className={`reveal ${i === 0 ? "md:col-span-2" : ""}`}>
                  <ProjectCard project={project} wide={i === 0} />
                </div>
              ))}
            </div>
          ) : (
            <ApiErrorNotice what="projects" />
          )}
        </Container>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="skills-heading">
        <Container>
          <SectionHeading
            id="skills-heading"
            label="Skills"
            title="What I work with"
            intro="Grouped by where they sit in a product. No percentage bars: the projects show the depth."
            href="/about"
            linkText="More about me"
          />
          <SkillsGrid />
        </Container>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="built-heading">
        <Container>
          <SectionHeading
            id="built-heading"
            label="This site"
            title="How this site is built"
            intro="The portfolio is a project too: a typed full-stack app with a documented API, a tuned database and infrastructure as code."
          />
          <HowItsBuilt />
        </Container>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="experience-heading">
        <Container>
          <SectionHeading id="experience-heading" label="Experience" title="Where I've worked" href="/experience" linkText="Details" />
          <ExperienceList items={experience} />
        </Container>
      </section>

      <Container className="pt-8">
        <CallToAction />
      </Container>
    </>
  );
}
