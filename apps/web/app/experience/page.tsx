import { Container } from "@/components/ui/Container";
import { ExperienceList } from "@/features/profile/ExperienceList";
import { PageHeader } from "@/components/ui/PageHeader";
import { experience } from "@/features/profile/profile";

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
