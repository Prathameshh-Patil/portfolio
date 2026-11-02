import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectCard } from "@/features/projects/ProjectCard";
import type { Project } from "@portfolio/contracts";
import { getProjects } from "@/features/projects/api";

export const metadata = { title: "Projects" };
export default async function ProjectsPage() {
  let projects: Project[] | null = null;
  try {
    projects = await getProjects(); // already sorted by the API: featured first, then sortOrder
  } catch {
    projects = null;
  }

  return (
    <Container>
      <PageHeader
        label="Projects"
        title="Things I've built"
        intro="Each project has a case study: the problem, what I built, the architecture, the trade-offs I made and the results."
      />
      {projects ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} heading="h2" />
          ))}
        </div>
      ) : (
        <ApiErrorNotice what="projects" />
      )}
    </Container>
  );
}
