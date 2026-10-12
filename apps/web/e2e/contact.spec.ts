import { expect, test } from "@playwright/test";
import { waitForHydratedForm } from "./helpers";

// The contact form posts to the API from the browser, so these tests mock it with page.route().
test.describe("contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
    await waitForHydratedForm(page);
  });

  test("shows validation errors and focuses the first invalid field", async ({ page }) => {
    let apiCalled = false;
    await page.route("**/api/contact", (route) => {
      apiCalled = true;
      return route.fulfill({ status: 201, json: { ok: true } });
    });

    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Please enter your name.")).toBeVisible();
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
    await expect(page.getByText("Please write at least 10 characters.")).toBeVisible();
    await expect(page.getByLabel("Name")).toBeFocused();
    await expect(page.getByLabel("Name")).toHaveAttribute("aria-invalid", "true");
    expect(apiCalled).toBe(false); // invalid input never reaches the API
  });

  test("sends the message and shows the success state", async ({ page }) => {
    let body: Record<string, string> | undefined;
    await page.route("**/api/contact", (route) => {
      body = route.request().postDataJSON();
      return route.fulfill({ status: 201, json: { ok: true, id: 1 } });
    });

    await page.getByLabel("Name").fill("Test Visitor");
    await page.getByLabel("Email").fill("visitor@example.com");
    await page.getByLabel("Message").fill("Hello, this is a test message.");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByText("Thanks, your message was sent.")).toBeVisible();
    expect(body).toMatchObject({ name: "Test Visitor", email: "visitor@example.com", body: "Hello, this is a test message.", website: "" });
  });

  test("explains a rate limit (429)", async ({ page }) => {
    await page.route("**/api/contact", (route) => route.fulfill({ status: 429, json: { error: "Too many messages" } }));
    await page.getByLabel("Name").fill("Test Visitor");
    await page.getByLabel("Email").fill("visitor@example.com");
    await page.getByLabel("Message").fill("Hello, this is a test message.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("several messages in the last hour");
  });
});
