import "dotenv/config";
import { createDb } from "./client.js";
import { projects } from "./schema.js";

// Starting content: the projects from my resume. Safe to run more than once.
const seed = [
  {
    slug: "slotwise",
    title: "Slotwise: Event Booking Platform",
    summary:
      "Full-stack booking site with timed seat holds, JWT auth and admin roles. A partial unique index lets the database allow only one active booking per seat; a test releases 12 simultaneous requests at one seat and asserts exactly one succeeds.",
    techStack: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Celery", "Redis", "Docker"],
    repoUrl: "https://github.com/Prathameshh-Patil/slotwise",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "replydesk",
    title: "ReplyDesk: AI Support Inbox with Human Approval",
    summary:
      "Support inbox where four single-purpose agents sort, extract, draft and check replies, and a human approves, edits or rejects every draft. Every agent output is schema-validated with one retry, and 60 labelled messages define the expected results.",
    techStack: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Pydantic", "gpt-oss-120b on Groq", "Docker"],
    repoUrl: "https://github.com/Prathameshh-Patil/replydesk",
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "intentbench",
    title: "IntentBench: Classical vs Fine-Tuned vs LLM Classification",
    summary:
      "In progress: comparing TF-IDF + logistic regression, fine-tuned DistilBERT and LLM classification on CLINC150 (150 intents). On validation so far, DistilBERT reaches 96.0% macro-F1 against 91.3% for the TF-IDF baseline.",
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
