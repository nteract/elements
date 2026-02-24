import { expect, test } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/nteract/i);
  });

  test("docs index loads", async ({ page }) => {
    await page.goto("/docs");
    // Fumadocs layout uses article for content
    await expect(page.locator("article")).toBeVisible();
  });
});
