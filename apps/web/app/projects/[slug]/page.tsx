import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";
import { TechList } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallToAction } from "@/components/ui/CallToAction";
import { Container } from "@/components/ui/Container";
import { ArrowLeft, ArrowUpRight, GitHub } from "@/components/ui/icons";
import type { Project } from "@portfolio/contracts";
import { ApiError } from "@/lib/api-client";
import { getProject } from "@/features/projects/api";
import { projectHighlights } from "@/features/projects/highlights";
import { TableOfContents } from "@/features/projects/TableOfContents";
import { ViewCounter } from "@/features/projects/ViewCounter";

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
  const highlight = projectHighlights[slug];

  return (
    <>
      <section className="relative isolate border-b border-border">
        <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10" />
        <Container className="pb-12 pt-10 sm:pb-16 sm:pt-14">
          <div className="flex items-center justify-between gap-4">
            <Link href="/projects" className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-text">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> All projects
            </Link>
            <ViewCounter slug={project.slug} initialViews={project.views} />
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="eyebrow">Case study</p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl">{project.title}</h1>
              <p className="mt-5 text-lg leading-relaxed text-muted">{project.summary}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {project.repoUrl && (
                  <ButtonLink href={project.repoUrl} variant="primary" size="lg" external>
                    <GitHub /> View code on GitHub
                  </ButtonLink>
                )}
                {/* Only shown when a real demo URL exists. */}
                {project.demoUrl && (
                  <ButtonLink href={project.demoUrl} size="lg" external>
                    Open demo <ArrowUpRight />
                  </ButtonLink>
                )}
              </div>
            </div>

            {highlight && (
              <div className="card min-w-0 p-6 lg:w-72">
                <p className="eyebrow !text-subtle">Key result</p>
                <p className="text-gradient mt-3 w-fit text-5xl font-semibold tracking-tight">{highlight.metric.value}</p>
                <p className="mt-2 text-sm leading-snug text-muted">{highlight.metric.label}</p>
              </div>
            )}
          </div>
        </Container>
      </section>

      <Container className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
        <article id="case-study" className="min-w-0 max-w-3xl">
          {CaseStudy ? <CaseStudy /> : <p className="text-muted">A detailed write-up for this project is coming soon.</p>}
        </article>

        <aside className="order-first space-y-8 lg:order-none">
          <div className="space-y-8 lg:sticky lg:top-24">
            <div>
              <h2 className="eyebrow !text-subtle">Tech stack</h2>
              <TechList items={project.techStack} className="mt-3" />
            </div>
            {highlight && (
              <div>
                <h2 className="eyebrow !text-subtle">Pipeline</h2>
                <ol className="mt-3 space-y-1.5 text-sm">
                  {highlight.flow.map((step, i) => (
                    <li key={step} className="flex items-center gap-2.5">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-surface-2 font-mono text-[10px] text-muted">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="hidden lg:block">
              <TableOfContents articleId="case-study" />
            </div>
          </div>
        </aside>
      </Container>

      <Container className="pt-6">
        <CallToAction title="Like how this was built? Let's talk." />
      </Container>
    </>
  );
}
