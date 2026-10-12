import { ApiErrorNotice } from "@/components/ApiErrorNotice";
import { ButtonLink } from "@/components/ButtonLink";
import { Container } from "@/components/Container";
import { ExperienceList } from "@/components/ExperienceList";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeading } from "@/components/SectionHeading";
import { experience, profile, resumes } from "@/lib/profile";
import { getProjects, type Project } from "@/lib/api";

export default async function HomePage() {
  // If the API is down, the rest of the page still renders; only this section shows an error.
  let featured: Project[] | null = null;
  try {
    featured = (await getProjects()).filter((p) => p.featured).slice(0, 3);
  } catch {
    featured = null;
  }

  return (
    <>
      <section className="pb-8 pt-16 sm:pb-12 sm:pt-24">
        <Container>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            {profile.name} · {profile.location}
          </p>
          <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl sm:leading-[1.1]">
            {profile.headline}
          </h1>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted sm:text-lg">{profile.bio}</p>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed">
            <span className="mr-2 inline-flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              Open to:
            </span>
            {profile.openTo.join(", ")} roles. {profile.availability}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={resumes.sde.file} variant="primary" download>
              Download resume
            </ButtonLink>
            <ButtonLink href={profile.github} external>GitHub</ButtonLink>
            <ButtonLink href={profile.linkedin} external>LinkedIn</ButtonLink>
            <ButtonLink href="/contact">Contact</ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-12" aria-labelledby="featured-heading">
        <Container>
          <SectionHeading label="Selected work" title="Featured projects" href="/projects" linkText="All projects" />
          {featured ? (
            <div className="grid gap-4 md:grid-cols-3">
              {featured.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          ) : (
            <ApiErrorNotice what="projects" />
          )}
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <SectionHeading label="Experience" title="Where I've worked" href="/experience" linkText="Details" />
          <ExperienceList items={experience} />
        </Container>
      </section>
    </>
  );
}
