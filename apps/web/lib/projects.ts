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
      "Full-stack booking site with seat holds, JWT auth and admin roles. Row-level locking inside a transaction prevents double booking; a test fires 50 simultaneous bookings at one seat and asserts exactly one succeeds.",
    techStack: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Celery", "Redis", "Docker"],
    repoUrl: "https://github.com/Prathameshh-Patil/slotwise",
    demoUrl: null,
    featured: true,
  },
  {
    slug: "replydesk",
    title: "ReplyDesk: AI Support Inbox with Human Approval",
    summary:
      "Support inbox where four single-purpose agents sort, extract, draft and check replies, and a human approves, edits or rejects every draft. Agent outputs are schema-validated and the pipeline is scored on 60 labelled messages.",
    techStack: ["Next.js", "FastAPI", "PostgreSQL", "Lyzr Agent Studio", "Docker"],
    repoUrl: "https://github.com/Prathameshh-Patil/replydesk",
    demoUrl: null,
    featured: true,
  },
  {
    slug: "intentbench",
    title: "IntentBench: Classical vs Fine-Tuned vs LLM Classification",
    summary:
      "Compared TF-IDF + logistic regression, fine-tuned DistilBERT and LLM zero-shot classification on CLINC150 for accuracy, macro-F1, latency and cost, then served the chosen model behind FastAPI.",
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
