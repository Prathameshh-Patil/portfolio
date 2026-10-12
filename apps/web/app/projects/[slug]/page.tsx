import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ApiErrorNotice } from "@/components/ApiErrorNotice";
import { ButtonLink } from "@/components/ButtonLink";
import { Container } from "@/components/Container";
import { ViewCounter } from "@/components/ViewCounter";
import { ApiError, getProject, type Project } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

// generateMetadata and the page both need the project; React's cache() makes that one API call per request.
// Returns null for "no such project" and throws for "API unreachable", so the two cases look different.
const loadProject = cache(async (slug: string): Promise<Project | null> => {
  try {
    return await getProject(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await loadProject((await params).slug).catch(() => null);
  return { title: project?.title ?? "Project" };
}

// The long-form write-up lives in content/projects/<slug>.mdx. A project added from the admin panel
// may not have one yet; then the page still works and shows just the summary.
async function loadCaseStudy(slug: string) {
  try {
    const mod = await import(`@/content/projects/${slug}.mdx`);
    return mod.default as React.ComponentType;
  } catch {
    return null;
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;

  let project: Project | null;
  try {
    project = await loadProject(slug);
  } catch {
    return (
      <Container className="max-w-3xl py-20">
        <ApiErrorNotice what="this project" />
      </Container>
    );
  }
  if (!project) notFound();

  const CaseStudy = await loadCaseStudy(slug);

  return (
    <Container className="max-w-3xl">
      <header className="pb-10 pt-14 sm:pt-20">
        <div className="flex items-center justify-between gap-4">
          <Link href="/projects" className="text-sm text-muted transition-colors hover:text-accent">
            <span aria-hidden="true">←</span> All projects
          </Link>
          <ViewCounter slug={project.slug} initialViews={project.views} />
        </div>
        <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{project.title}</h1>
        <p className="mt-4 leading-relaxed text-muted sm:text-lg">{project.summary}</p>

        <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {project.techStack.map((tech) => (
            <li key={tech} className="rounded bg-accent-soft px-2 py-0.5 font-mono text-xs">
              {tech}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          {project.repoUrl && (
            <ButtonLink href={project.repoUrl} variant="primary" external>
              View code on GitHub
            </ButtonLink>
          )}
          {/* Only shown when a real demo URL exists. */}
          {project.demoUrl && (
            <ButtonLink href={project.demoUrl} external>
              Open demo
            </ButtonLink>
          )}
        </div>
      </header>

      <article className="border-t border-border pt-12">
        {CaseStudy ? <CaseStudy /> : <p className="text-muted">A detailed write-up for this project is coming soon.</p>}
      </article>
    </Container>
  );
}
