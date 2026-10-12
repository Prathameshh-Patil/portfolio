import { z } from "zod";

// Two URLs for the same API, because the server and the browser reach it from different places:
// - API_URL_INTERNAL: used by Server Components. Inside Docker the web container reaches the API by
//   its service name (http://api:4000); "localhost" there would mean the web container itself.
// - NEXT_PUBLIC_API_URL: used by the browser (view counter, contact form, admin). The browser runs on
//   the host machine, where the API is published on http://localhost:4000. Next.js inlines
//   NEXT_PUBLIC_* values into the client bundle at build time, so this one must be set when building.
// Both default to localhost:4000 so `npm run dev` works with no extra config.
const apiUrl = z.url().default("http://localhost:4000");

function parseUrl(name: string, value: string | undefined) {
  const result = apiUrl.safeParse(value);
  if (!result.success) throw new Error(`${name} must be a full URL like http://localhost:4000, got "${value}"`);
  return result.data;
}

// Written as a literal `process.env.NEXT_PUBLIC_API_URL` so Next.js can inline it.
export const publicApiUrl = parseUrl("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL);

// Server-only. Read when called (not at import) so client bundles never evaluate it.
export function internalApiUrl() {
  return parseUrl("API_URL_INTERNAL", process.env.API_URL_INTERNAL);
}
