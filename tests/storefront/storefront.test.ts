import { test, expect } from "@playwright/test";

test("storefront homepage has text and loads successfully", async ({
  page,
}) => {
  await page.goto("/");

  // Check that the page loads without errors by checking there is a text that says Hope World
  expect(page.content()).toContain("Hope World");

  // Basic check that the page content is loaded
  await expect(page.locator("body")).not.toBeEmpty();
});
