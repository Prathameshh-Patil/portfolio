import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";
import { CallToAction } from "@/components/ui/CallToAction";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Project } from "@portfolio/contracts";
import { getProjects } from "@/features/projects/api";
import { ProjectGrid } from "@/features/projects/ProjectGrid";

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
      {projects ? <ProjectGrid projects={projects} /> : <ApiErrorNotice what="projects" />}
      <div className="mt-24">
        <CallToAction title="Want the details behind a project?" />
      </div>
    </Container>
  );
}
