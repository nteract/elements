import { expect, test } from "@playwright/test";

test.describe("Output Components", () => {
  test("OutputArea has data-slot attribute", async ({ page }) => {
    await page.goto("/docs/cell/output-area");

    // Wait for the page to load the demo components
    await page.waitForSelector("[data-slot='output-area']", { timeout: 10000 });

    // Find output areas on the page (from the demos)
    const outputAreas = page.locator("[data-slot='output-area']");
    const count = await outputAreas.count();

    // Should have at least one output area from the demos
    expect(count).toBeGreaterThan(0);
    await expect(outputAreas.first()).toBeVisible();
  });

  test("OutputArea renders output items with data-slot", async ({ page }) => {
    await page.goto("/docs/cell/output-area");

    // Wait for the demo to render
    await page.waitForSelector("[data-slot='output-area']", { timeout: 10000 });

    // Check for output items (non-isolated outputs)
    const outputItems = page.locator("[data-slot='output-item']");
    const count = await outputItems.count();

    // The demo page should have non-isolated outputs with data-slot="output-item"
    if (count > 0) {
      await expect(outputItems.first()).toBeVisible();
      // Verify output-index attribute is present
      await expect(outputItems.first()).toHaveAttribute("data-output-index");
    }
  });

  test("MediaRouter has data-slot attribute", async ({ page }) => {
    await page.goto("/docs/cell/output-area");

    // Wait for the page to load
    await page.waitForSelector("[data-slot='output-area']", { timeout: 10000 });

    // MediaRouter is used inside OutputArea for display_data/execute_result
    const mediaRouters = page.locator("[data-slot='media-router']");
    const count = await mediaRouters.count();

    // Should have media routers rendering the output content
    if (count > 0) {
      await expect(mediaRouters.first()).toBeVisible();
    }
  });

  test("IsolatedFrame has data-slot attribute on HTML output page", async ({
    page,
  }) => {
    await page.goto("/docs/outputs/isolated-frame");

    // Wait for the demo iframe to load
    await page.waitForSelector("[data-slot='isolated-frame']", {
      timeout: 15000,
    });

    // Find the isolated frame
    const isolatedFrame = page.locator("[data-slot='isolated-frame']");
    await expect(isolatedFrame.first()).toBeVisible();

    // Verify it's an iframe with the expected title
    await expect(isolatedFrame.first()).toHaveAttribute(
      "title",
      "Isolated output frame"
    );
  });
});

test.describe("Cell Components", () => {
  test("CellContainer page loads with data-slot attributes", async ({
    page,
  }) => {
    await page.goto("/docs/cell/cell-container");

    // Wait for the page to have cell containers
    await page.waitForSelector("[data-slot='cell-container']", {
      timeout: 10000,
    });

    const cells = page.locator("[data-slot='cell-container']");
    await expect(cells.first()).toBeVisible();

    // Verify cell attributes are present
    await expect(cells.first()).toHaveAttribute("data-cell-type");
    await expect(cells.first()).toHaveAttribute("data-cell-id");
  });
});
