import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { ArrowUpRight, Download } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { resumeFile } from "@/features/profile/profile";

export const metadata = { title: "Resume" };

export default function ResumePage() {
  return (
    <Container className="max-w-5xl">
      <PageHeader label="Resume" title="Resume" intro="One page: experience, projects, skills and education.">
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={resumeFile} variant="primary" size="lg" download>
            <Download /> Download PDF
          </ButtonLink>
          <ButtonLink href={resumeFile} size="lg" external>
            Open in new tab <ArrowUpRight />
          </ButtonLink>
        </div>
      </PageHeader>

      {/* Inline preview on larger screens only; mobile browsers handle embedded PDFs poorly. */}
      <div className="card hidden overflow-hidden p-2 md:block">
        <iframe src={resumeFile} title="Resume preview" className="h-[85vh] w-full rounded-xl bg-surface" />
      </div>
    </Container>
  );
}
