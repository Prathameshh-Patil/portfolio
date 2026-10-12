import { internalApiUrl, publicApiUrl } from "./env";

// A bad env value stops the server immediately with a clear message, instead of every page
// failing later (same idea as apps/api/src/config.ts).
try {
  console.log(`API: server-side ${internalApiUrl()}, browser ${publicApiUrl}`);
} catch (err) {
  console.error(`Invalid environment variables: ${(err as Error).message}`);
  process.exit(1);
}
