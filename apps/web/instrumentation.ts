// Runs once when the Next.js server starts. The check lives in a separate file because it uses
// Node-only APIs (process.exit), and this file is also compiled for the Edge runtime.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@/lib/check-env");
  }
}
