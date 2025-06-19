import { test, expect } from "@playwright/test";

test("admin site has text and loads successfully", async ({ page }) => {
  await page.goto("/");

  // Check for text with a locator instead of checking entire page content
  await expect(page.getByText("Hope World")).toBeVisible();

  // Basic check that the page content is loaded
  await expect(page.locator("body")).not.toBeEmpty();
});
