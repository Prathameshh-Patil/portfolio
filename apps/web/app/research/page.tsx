import { notFound } from "next/navigation";
import { ApiErrorNotice } from "@/components/ApiErrorNotice";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { loadPublications, statusLabels } from "@/lib/publications";

export const metadata = { title: "Research" };

export default async function ResearchPage() {
  const publications = await loadPublications();
  // No entries yet: the page doesn't exist, matching the nav (which hides the link).
  if (publications?.length === 0) notFound();

  return (
    <Container className="max-w-3xl">
      <PageHeader label="Research" title="Publications" />
      {publications ? (
        <ol className="divide-y divide-border border-y border-border">
          {publications.map((paper) => (
            <li key={paper.id} className="py-8">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
                <span className="rounded bg-accent-soft px-2 py-0.5 text-text">{statusLabels[paper.status]}</span>
                {(paper.venue || paper.year) && <span>{[paper.venue, paper.year].filter(Boolean).join(", ")}</span>}
              </div>
              <h2 className="mt-3 text-lg font-semibold leading-snug tracking-tight">
                {paper.url ? (
                  <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                    {paper.title} <span aria-hidden="true" className="text-muted">↗</span>
                  </a>
                ) : (
                  paper.title
                )}
              </h2>
              <p className="mt-1 text-sm text-muted">{paper.authors}</p>
              <p className="mt-3 leading-relaxed">{paper.summary}</p>
            </li>
          ))}
        </ol>
      ) : (
        <ApiErrorNotice what="publications" />
      )}
    </Container>
  );
}
