import { ButtonLink } from "@/components/ButtonLink";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { ArrowUpRight, Download } from "@/components/icons";
import { resumeFile } from "@/lib/profile";

export const metadata = { title: "Resume" };

export default function ResumePage() {
  return (
    <Container className="max-w-4xl">
      <PageHeader label="Resume" title="Resume" intro="One page: experience, projects, skills and education." />

      <div className="flex flex-wrap gap-3">
        <ButtonLink href={resumeFile} variant="primary" download>
          <Download /> Download PDF
        </ButtonLink>
        <ButtonLink href={resumeFile} external>
          Open in new tab <ArrowUpRight />
        </ButtonLink>
      </div>

      {/* Inline preview on larger screens only; mobile browsers handle embedded PDFs poorly. */}
      <iframe
        src={resumeFile}
        title="Resume preview"
        className="mt-8 hidden h-[80vh] w-full rounded-lg border border-border bg-surface md:block"
      />
    </Container>
  );
}
