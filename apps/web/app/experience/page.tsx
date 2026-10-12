import { Container } from "@/components/Container";
import { ExperienceList } from "@/components/ExperienceList";
import { PageHeader } from "@/components/PageHeader";
import { experience } from "@/lib/profile";

export const metadata = { title: "Experience" };

export default function ExperiencePage() {
  return (
    <Container className="max-w-3xl">
      <PageHeader
        label="Experience"
        title="Where I've worked"
        intro="11 months of internships building backend services, LLM features and the infrastructure around them."
      />
      <ExperienceList items={experience} heading="h2" />
    </Container>
  );
}
