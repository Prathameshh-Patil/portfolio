import { expect, test } from "@playwright/test";
import { waitForHydratedForm } from "./helpers";

const stats = { messages: 3, unreadMessages: 1, topProjects: [{ slug: "slotwise", title: "Slotwise", views: 12 }] };

test.describe("admin", () => {
  test("redirects to login without a token", async ({ page }) => {
    await page.goto("/admin/messages");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("heading", { name: "Admin login" })).toBeVisible();
  });

  test("admin pages are marked noindex", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  });

  test("wrong password shows an error; right password opens the dashboard", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      const { password } = route.request().postDataJSON();
      return password === "right-password"
        ? route.fulfill({ json: { token: "test-token" } })
        : route.fulfill({ status: 401, json: { error: "Invalid email or password" } });
    });
    let authHeader: string | null = null;
    await page.route("**/api/admin/stats", (route) => {
      authHeader = route.request().headers()["authorization"];
      return route.fulfill({ json: stats });
    });

    await page.goto("/admin/login");
    await waitForHydratedForm(page);
    await page.getByLabel("Email").fill("admin@example.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Wrong email or password.");

    await page.getByLabel("Password").fill("right-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    expect(authHeader).toBe("Bearer test-token"); // the token is sent on admin requests
  });

  test("an expired token sends you back to login", async ({ page }) => {
    await page.route("**/api/admin/stats", (route) => route.fulfill({ status: 401, json: { error: "Invalid or expired token" } }));
    await page.goto("/admin/login");
    await page.evaluate(() => sessionStorage.setItem("admin-token", "expired-token"));
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login\?expired=1$/);
    await expect(page.getByText("Your session expired.")).toBeVisible();
  });
});
