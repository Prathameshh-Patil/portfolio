import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { getProjects } from "@/lib/projects";

export const metadata = { title: "Projects" };

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <Container>
      <PageHeader
        label="Projects"
        title="Things I've built"
        intro="Each project has a case study: the problem, what I built, the architecture, the trade-offs I made and the results."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </Container>
  );
}
