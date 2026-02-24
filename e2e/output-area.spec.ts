/**
 * E2E tests for the OutputArea component documentation page.
 * Tests all output types: text/plain, stream, error, JSON, HTML isolation.
 */
import { expect, type Page, test } from "@playwright/test";

/**
 * Wait for content inside an iframe by polling with evalInIframe.
 */
async function waitForIframeContent(
  page: Page,
  checkCode: string,
  expectedValue: string | RegExp,
  iframeLocator: ReturnType<Page["locator"]>,
  timeout = 10000,
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const result = await evalInIframeLocator(
      page,
      checkCode,
      iframeLocator,
      2000,
    );
    if (result.success && result.result) {
      if (typeof expectedValue === "string") {
        if (result.result.includes(expectedValue)) return;
      } else {
        if (expectedValue.test(result.result)) return;
      }
    }
    await page.waitForTimeout(50);
  }
  throw new Error(
    `Timeout waiting for iframe content matching ${expectedValue}`,
  );
}

/**
 * Evaluate code inside an iframe via postMessage using a locator.
 * Uses the frame-html.ts protocol: { type: "eval", payload: { code } }
 */
async function evalInIframeLocator(
  page: Page,
  code: string,
  iframeLocator: ReturnType<Page["locator"]>,
  timeout = 10000,
): Promise<{ success: boolean; result?: string; error?: string }> {
  const resultPromise = page.evaluate(
    ({ timeout }) => {
      return new Promise<{ success: boolean; result?: string; error?: string }>(
        (resolve) => {
          const timeoutId = setTimeout(() => {
            window.removeEventListener("message", handler);
            resolve({ success: false, error: "Timeout waiting for response" });
          }, timeout);

          function handler(event: MessageEvent) {
            // frame-html.ts sends { type: "eval_result", payload: { success, result, error } }
            if (event.data?.type === "eval_result") {
              window.removeEventListener("message", handler);
              clearTimeout(timeoutId);
              const payload = event.data.payload || {};
              if (payload.error) {
                resolve({ success: false, error: payload.error });
              } else {
                resolve({
                  success: payload.success !== false,
                  result: String(payload.result ?? ""),
                });
              }
            }
          }
          window.addEventListener("message", handler);
        },
      );
    },
    { timeout },
  );

  const iframeElement = await iframeLocator.first().elementHandle();
  if (!iframeElement) {
    return { success: false, error: "Iframe not found" };
  }

  // frame-html.ts expects { type: "eval", payload: { code } }
  await page.evaluate(
    ({ iframe, code }) => {
      const contentWindow = (iframe as HTMLIFrameElement).contentWindow;
      if (contentWindow) {
        contentWindow.postMessage({ type: "eval", payload: { code } }, "*");
      }
    },
    { iframe: iframeElement, code },
  );

  return resultPromise;
}

test.describe("OutputArea Documentation Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs/cell/output-area");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("OutputArea");
  });

  test("page loads with all demo sections", async ({ page }) => {
    // Check page title
    await expect(page.locator("h1")).toContainText("OutputArea");

    // Check that all demo section headings are present (use role to avoid TOC duplication)
    await expect(
      page.getByRole("heading", { name: "Simple Output" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Stream and Result" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Error Output" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Collapsible" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "With Max Height" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Isolated Rendering" }),
    ).toBeVisible();
  });

  test("multi output at top of page renders stream and execute_result", async ({
    page,
  }) => {
    // The first demo on the page (before any heading) is "multi" variant
    const topDemo = page.locator("[data-slot='output-area']").first();
    await expect(topDemo).toBeVisible();

    // Check for stream output content
    await expect(topDemo).toContainText("Processing data...");
    await expect(topDemo).toContainText("Loading model...");

    // Check for execute_result content (JSON)
    await expect(topDemo).toContainText("accuracy");
  });

  test("output areas render text/plain content", async ({ page }) => {
    // Find all output areas on the page
    const outputAreas = page.locator("[data-slot='output-area']");

    // There should be multiple output areas
    const count = await outputAreas.count();
    expect(count).toBeGreaterThan(3);

    // The simple output (second one after the top multi) should have "42"
    // Let's check by finding output areas that contain specific content
    await expect(page.locator("[data-slot='output-area']")).toContainText([
      "42",
    ]);
  });

  test("error output renders ANSI traceback with colors", async ({ page }) => {
    // Find an output area that contains the error
    const errorArea = page
      .locator("[data-slot='output-area']")
      .filter({ hasText: "ValueError" });
    await expect(errorArea).toBeVisible();

    // Check for error content
    await expect(errorArea).toContainText("ValueError");
    await expect(errorArea).toContainText("invalid literal for int()");

    // Verify ANSI output element exists within the error area
    const ansiOutput = errorArea.locator("[data-slot='ansi-output']").first();
    await expect(ansiOutput).toBeVisible();
  });

  test("collapsible output shows content", async ({ page }) => {
    // Find output areas that show the multi-output content
    const outputAreas = page.locator("[data-slot='output-area']");

    // Multiple output areas should contain the stream content
    await expect(
      outputAreas.filter({ hasText: "Processing data..." }).first(),
    ).toBeVisible();
  });

  test("HTML output renders in isolated iframe", async ({ page }) => {
    // Find the isolated frame on the page - there should be exactly one
    // (the HTML table demo in the Isolated Rendering section)
    const isolatedFrame = page.locator("[data-slot='isolated-frame']").first();
    await expect(isolatedFrame).toBeVisible();

    // Wait for table content to render inside iframe
    await waitForIframeContent(
      page,
      "document.querySelector('table')?.outerHTML || 'not found'",
      "<table",
      isolatedFrame,
    );

    // Verify table headers using evalInIframe
    const result = await evalInIframeLocator(
      page,
      "Array.from(document.querySelectorAll('th')).map(th => th.textContent).join(',')",
      isolatedFrame,
    );

    expect(result.success).toBe(true);
    expect(result.result).toContain("Model");
    expect(result.result).toContain("Accuracy");
    expect(result.result).toContain("F1 Score");
  });

  test("HTML output table data renders correctly in iframe", async ({
    page,
  }) => {
    // Find the isolated frame
    const isolatedFrame = page.locator("[data-slot='isolated-frame']").first();
    await expect(isolatedFrame).toBeVisible();

    // Wait for table to render
    await waitForIframeContent(
      page,
      "document.querySelector('tbody')?.textContent || 'not found'",
      "Random Forest",
      isolatedFrame,
    );

    // Verify table body data
    const result = await evalInIframeLocator(
      page,
      "Array.from(document.querySelectorAll('tbody td')).map(td => td.textContent).join(',')",
      isolatedFrame,
    );

    expect(result.success).toBe(true);
    expect(result.result).toContain("Random Forest");
    expect(result.result).toContain("XGBoost");
    expect(result.result).toContain("0.94");
    expect(result.result).toContain("0.96");
  });
});

test.describe("OutputArea Security", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs/cell/output-area");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("OutputArea");
  });

  test("HTML output iframe has sandbox restrictions", async ({ page }) => {
    const isolatedFrame = page.locator("[data-slot='isolated-frame']").first();
    await expect(isolatedFrame).toBeVisible();

    // Verify sandbox attribute
    const sandbox = await isolatedFrame.getAttribute("sandbox");
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).not.toContain("allow-same-origin");
  });

  test("HTML output iframe cannot access parent", async ({ page }) => {
    const isolatedFrame = page.locator("[data-slot='isolated-frame']").first();
    await expect(isolatedFrame).toBeVisible();

    // Wait for iframe to be ready
    await waitForIframeContent(
      page,
      "document.querySelector('table') ? 'ready' : 'not ready'",
      "ready",
      isolatedFrame,
    );

    // Try to access parent - should fail
    const result = await evalInIframeLocator(
      page,
      "try { parent.document.title } catch(e) { 'blocked: ' + e.name }",
      isolatedFrame,
    );

    expect(result.success).toBe(true);
    expect(result.result).toContain("blocked");
  });
});
