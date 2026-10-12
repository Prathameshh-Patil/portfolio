import { expect, test } from "@playwright/test";

test.describe("public pages", () => {
  test("home page loads with headline, featured projects and no Research link", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Prathamesh Patil");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Full-stack engineer");
    // Featured projects come from the (mock) API, rendered on the server.
    const featured = page.locator("section", { has: page.getByRole("heading", { name: "Featured projects" }) });
    await expect(featured.getByRole("article")).toHaveCount(3);
    await expect(featured.getByRole("link", { name: "Slotwise: Event Booking Platform", exact: true })).toBeVisible();
    // No publications in the mock API, so Research stays out of the nav.
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Research" })).toHaveCount(0);
  });

  test("project page loads the case study and records a view", async ({ page }) => {
    // The view counter calls the API from the browser; intercept it.
    let viewRequests = 0;
    await page.route("**/api/projects/slotwise/view", (route) => {
      viewRequests++;
      return route.fulfill({ json: { views: 8 } });
    });

    await page.goto("/projects/slotwise");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Slotwise: Event Booking Platform");
    await expect(page.getByRole("heading", { name: "Problem" })).toBeVisible();
    await expect(page.getByRole("img", { name: /Slotwise/ })).toBeVisible(); // architecture diagram
    await expect(page.getByText("8 views")).toBeVisible();

    // Reloading in the same session doesn't count again.
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(viewRequests).toBe(1);
  });

  test("unknown project shows the 404 page", async ({ page }) => {
    const response = await page.goto("/projects/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This page doesn't exist." })).toBeVisible();
  });

  test("a failing API shows a friendly message instead of crashing", async ({ page }) => {
    await page.goto("/projects/api-error");
    await expect(page.getByText("Couldn't load this project right now.")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible(); // rest of the page still works
  });

  test("theme toggle switches between light and dark", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/about");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "Toggle dark mode" }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("mobile: menu opens, closes with Escape, and pages don't scroll sideways", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const path of ["/", "/projects", "/projects/slotwise", "/about", "/contact"]) {
      await page.goto(path);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, `${path} is wider than the screen`).toBeLessThanOrEqual(360);
    }
    const menuButton = page.getByRole("button", { name: "Open menu" });
    await menuButton.click();
    await expect(page.locator("#mobile-nav").getByRole("link", { name: "Projects" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#mobile-nav")).toHaveCount(0);
    await expect(menuButton).toBeFocused();
  });
});
