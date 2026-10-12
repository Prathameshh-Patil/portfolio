import type { Page } from "@playwright/test";

// Forms are server-rendered, then React attaches the submit handler. Clicking before that would do a
// plain browser POST, so tests wait until the form element has React's internal properties.
export async function waitForHydratedForm(page: Page) {
  await page.waitForFunction(() => {
    const form = document.querySelector("main form");
    return !!form && Object.keys(form).some((key) => key.startsWith("__react"));
  });
}
