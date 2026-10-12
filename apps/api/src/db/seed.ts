import "dotenv/config";
import { createDb } from "./client.js";
import { projects } from "./schema.js";

// Starting content: the projects from my resume. Safe to run more than once.
const seed = [
  {
    slug: "slotwise",
    title: "Slotwise: Event Booking Platform",
    summary:
      "Full-stack booking site with seat holds, JWT auth and admin roles. Row-level locking inside a transaction prevents double booking; a test fires 50 simultaneous bookings at one seat and asserts exactly one succeeds.",
    techStack: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Celery", "Redis", "Docker"],
    repoUrl: "https://github.com/Prathameshh-Patil/slotwise",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "replydesk",
    title: "ReplyDesk: AI Support Inbox with Human Approval",
    summary:
      "Support inbox where four single-purpose agents sort, extract, draft and check replies, and a human approves, edits or rejects every draft. Agent outputs are schema-validated and the pipeline is scored on 60 labelled messages.",
    techStack: ["Next.js", "FastAPI", "PostgreSQL", "Lyzr Agent Studio", "Docker"],
    repoUrl: "https://github.com/Prathameshh-Patil/replydesk",
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "intentbench",
    title: "IntentBench: Classical vs Fine-Tuned vs LLM Classification",
    summary:
      "Compared TF-IDF + logistic regression, fine-tuned DistilBERT and LLM zero-shot classification on CLINC150 for accuracy, macro-F1, latency and cost, then served the chosen model behind FastAPI.",
    techStack: ["PyTorch", "Hugging Face", "scikit-learn", "FastAPI"],
    repoUrl: "https://github.com/Prathameshh-Patil/intentbench",
    featured: true,
    sortOrder: 3,
  },
  {
    slug: "loan-underwriting-agent",
    title: "Loan Document Underwriting Agent",
    summary:
      "12-agent pipeline that turns a ZIP of mixed loan documents into one underwriting summary with confidence scores and risk flags, with deterministic validators for PAN, Aadhaar, GSTIN and IFSC.",
    techStack: ["Python", "Lyzr Agent Studio", "Tesseract OCR"],
    repoUrl: "https://github.com/Prathameshh-Patil/Intelligent-Loan-Document-Processing",
    sortOrder: 4,
  },
];

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const { db, pool } = createDb(url);
await db.insert(projects).values(seed).onConflictDoNothing({ target: projects.slug });
console.log(`Seeded ${seed.length} projects (existing slugs were skipped)`);
await pool.end();
