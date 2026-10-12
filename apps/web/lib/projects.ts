// Phase 1 placeholder: the same data the API seeds (apps/api/src/db/seed.ts).
// Phase 3 replaces this with a server-side fetch from GET /api/projects.

export type ProjectSummary = {
  slug: string;
  title: string;
  summary: string;
  techStack: string[];
  repoUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
};

export const staticProjects: ProjectSummary[] = [
  {
    slug: "slotwise",
    title: "Slotwise: Event Booking Platform",
    summary:
      "Full-stack booking site with timed seat holds, JWT auth and admin roles. A partial unique index lets the database allow only one active booking per seat; a test releases 12 simultaneous requests at one seat and asserts exactly one succeeds.",
    techStack: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Celery", "Redis", "Docker"],
    repoUrl: "https://github.com/Prathameshh-Patil/slotwise",
    demoUrl: null,
    featured: true,
  },
  {
    slug: "replydesk",
    title: "ReplyDesk: AI Support Inbox with Human Approval",
    summary:
      "Support inbox where four single-purpose agents sort, extract, draft and check replies, and a human approves, edits or rejects every draft. Every agent output is schema-validated with one retry, and 60 labelled messages define the expected results.",
    techStack: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Pydantic", "gpt-oss-120b on Groq", "Docker"],
    repoUrl: "https://github.com/Prathameshh-Patil/replydesk",
    demoUrl: null,
    featured: true,
  },
  {
    slug: "intentbench",
    title: "IntentBench: Classical vs Fine-Tuned vs LLM Classification",
    summary:
      "In progress: comparing TF-IDF + logistic regression, fine-tuned DistilBERT and LLM classification on CLINC150 (150 intents). On validation so far, DistilBERT reaches 96.0% macro-F1 against 91.3% for the TF-IDF baseline.",
    techStack: ["PyTorch", "Hugging Face", "scikit-learn", "FastAPI"],
    repoUrl: "https://github.com/Prathameshh-Patil/intentbench",
    demoUrl: null,
    featured: true,
  },
  {
    slug: "loan-underwriting-agent",
    title: "Loan Document Underwriting Agent",
    summary:
      "12-agent pipeline that turns a ZIP of mixed loan documents into one underwriting summary with confidence scores and risk flags, with deterministic validators for PAN, Aadhaar, GSTIN and IFSC.",
    techStack: ["Python", "Lyzr Agent Studio", "Tesseract OCR"],
    repoUrl: "https://github.com/Prathameshh-Patil/Intelligent-Loan-Document-Processing",
    demoUrl: null,
    featured: false,
  },
];

export function getProjects() {
  // Same order as the API: featured first, then the seed order.
  return [...staticProjects].sort((a, b) => Number(b.featured) - Number(a.featured));
}

export function getProject(slug: string) {
  return staticProjects.find((p) => p.slug === slug) ?? null;
}
