// Extra presentation data for project cards, keyed by slug (like the MDX case studies).
// Every value here comes from the case study or the project's repo. Never add a number that isn't there.
// A project created in the admin panel without an entry here still gets a normal card.

export type ProjectHighlight = {
  tagline: string; // one sentence: the problem it solves
  metric: { value: string; label: string }; // one real, sourced result
  flow: string[]; // the pipeline, shown as the card's preview
  status?: string; // e.g. "In progress"
};

export const projectHighlights: Record<string, ProjectHighlight> = {
  slotwise: {
    tagline: "Event booking that can't sell the same seat twice, even when requests arrive at the same instant.",
    metric: { value: "12 → 1", label: "simultaneous holds on one seat; the test asserts exactly one wins" },
    flow: ["Next.js", "FastAPI", "PostgreSQL", "Celery + Redis"],
  },
  replydesk: {
    tagline: "AI drafts every support reply; a person approves, edits or rejects it before anything is sent.",
    metric: { value: "97%", label: "category accuracy on 60 labelled messages, with no invented details" },
    flow: ["Sort", "Extract", "Draft", "Check", "Human"],
  },
  intentbench: {
    tagline: "Choosing which text classifier to ship by comparing a classical model, a fine-tuned transformer and an LLM.",
    metric: { value: "91.8%", label: "test accuracy, DistilBERT + out-of-scope threshold (5,500 queries)" },
    flow: ["CLINC150", "3 approaches", "Test once", "Serve"],
  },
  "loan-underwriting-agent": {
    tagline: "Turns a ZIP of mixed loan documents into one underwriting summary with confidence scores and risk flags.",
    metric: { value: "0.94", label: "confidence on the complete sample application" },
    flow: ["ZIP", "OCR", "12 agents", "Checks", "Summary"],
  },
};
