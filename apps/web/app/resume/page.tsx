import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { ResumePicker } from "@/components/ResumePicker";

export const metadata = { title: "Resume" };

export default function ResumePage() {
  return (
    <Container className="max-w-4xl">
      <PageHeader
        label="Resume"
        title="Resume"
        intro="I keep one resume per role so the most relevant work comes first. Pick the one that fits."
      />
      <ResumePicker />
    </Container>
  );
}
