/**
 * E2E tests for the Jupyter Widgets documentation page.
 * Tests widget isolation pipeline: OutputArea → IsolatedFrame → isolated-renderer → WidgetView
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

test.describe("Widgets Page - Isolation Pipeline", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs/widgets");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Jupyter Widgets");
  });

  test("page loads with Live Demo section", async ({ page }) => {
    // Check page title
    await expect(page.locator("h1")).toContainText("Jupyter Widgets");

    // Check Live Demo section exists
    await expect(
      page.getByRole("heading", { name: "Live Demo" }),
    ).toBeVisible();

    // Check demo container exists
    await expect(page.locator('[data-testid="widgets-demo"]')).toBeVisible();
  });

  test("IntSlider widget renders in isolated iframe", async ({ page }) => {
    const demo = page.locator('[data-testid="slider-widget-demo"]');
    await expect(demo).toBeVisible();

    const isolatedFrame = demo.locator("[data-slot='isolated-frame']");
    await expect(isolatedFrame).toBeVisible({ timeout: 10000 });

    // Verify slider rendered inside iframe
    await waitForIframeContent(
      page,
      "document.querySelector('[data-widget-type=\"IntSlider\"]') ? 'found' : 'not found'",
      "found",
      isolatedFrame,
      15000,
    );
  });

  test("OutputWidget renders in isolated iframe with stream content", async ({
    page,
  }) => {
    const demo = page.locator('[data-testid="output-widget-demo"]');
    const isolatedFrame = demo.locator("[data-slot='isolated-frame']");
    await expect(isolatedFrame).toBeVisible({ timeout: 15000 });

    // Wait for OutputWidget to render inside iframe (longer timeout for CommBridge sync)
    await waitForIframeContent(
      page,
      "document.querySelector('[data-widget-type=\"Output\"]') ? 'found' : 'not found'",
      "found",
      isolatedFrame,
      20000,
    );

    // Verify stream output rendered - the text should be in body.textContent
    // Stream outputs render directly (not in nested iframe) via AnsiStreamOutput
    await waitForIframeContent(
      page,
      "document.body.textContent || ''",
      "Processing",
      isolatedFrame,
      15000,
    );
  });

  test("OutputWidget shows HTML table content in iframe", async ({ page }) => {
    const demo = page.locator('[data-testid="output-widget-demo"]');
    const isolatedFrame = demo.locator("[data-slot='isolated-frame']");
    await expect(isolatedFrame).toBeVisible({ timeout: 10000 });

    // Wait for table content to render
    await waitForIframeContent(
      page,
      "document.querySelector('table')?.textContent || 'not found'",
      "Ready",
      isolatedFrame,
      15000,
    );

    // Verify table data
    const result = await evalInIframeLocator(
      page,
      "Array.from(document.querySelectorAll('td')).map(td => td.textContent).join(',')",
      isolatedFrame,
    );
    expect(result.success).toBe(true);
    expect(result.result).toContain("Status");
    expect(result.result).toContain("Ready");
  });

  test("dynamic state updates propagate through CommBridge", async ({
    page,
  }) => {
    const demo = page.locator('[data-testid="output-widget-demo"]');
    const isolatedFrame = demo.locator("[data-slot='isolated-frame']");
    await expect(isolatedFrame).toBeVisible({ timeout: 10000 });

    // Wait for initial render
    await waitForIframeContent(
      page,
      "document.querySelector('[data-widget-type=\"Output\"]') ? 'ready' : 'not ready'",
      "ready",
      isolatedFrame,
    );

    // Click append button (sends comm_msg)
    await page.locator('[data-testid="append-output-btn"]').click();

    // Verify new output appears in iframe
    await waitForIframeContent(
      page,
      "document.body.textContent || ''",
      "Step 3 complete",
      isolatedFrame,
      10000,
    );
  });

  test("clicking append button multiple times adds outputs", async ({
    page,
  }) => {
    const demo = page.locator('[data-testid="output-widget-demo"]');
    const isolatedFrame = demo.locator("[data-slot='isolated-frame']");
    await expect(isolatedFrame).toBeVisible({ timeout: 10000 });

    // Wait for initial render
    await waitForIframeContent(
      page,
      "document.querySelector('[data-widget-type=\"Output\"]') ? 'ready' : 'not ready'",
      "ready",
      isolatedFrame,
    );

    // Click append button twice
    await page.locator('[data-testid="append-output-btn"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-testid="append-output-btn"]').click();

    // Verify both outputs appear
    await waitForIframeContent(
      page,
      "document.body.textContent || ''",
      "Step 4 complete",
      isolatedFrame,
      10000,
    );
  });
});

test.describe("Widgets Page - Security", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs/widgets");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Jupyter Widgets");
  });

  test("IntSlider iframe has sandbox restrictions", async ({ page }) => {
    const demo = page.locator('[data-testid="slider-widget-demo"]');
    const isolatedFrame = demo.locator("[data-slot='isolated-frame']");
    await expect(isolatedFrame).toBeVisible({ timeout: 10000 });

    const sandbox = await isolatedFrame.getAttribute("sandbox");
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).not.toContain("allow-same-origin");
  });

  test("OutputWidget iframe has sandbox restrictions", async ({ page }) => {
    const demo = page.locator('[data-testid="output-widget-demo"]');
    const isolatedFrame = demo.locator("[data-slot='isolated-frame']");
    await expect(isolatedFrame).toBeVisible({ timeout: 10000 });

    const sandbox = await isolatedFrame.getAttribute("sandbox");
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).not.toContain("allow-same-origin");
  });

  test("OutputWidget iframe cannot access parent", async ({ page }) => {
    const demo = page.locator('[data-testid="output-widget-demo"]');
    const isolatedFrame = demo.locator("[data-slot='isolated-frame']");
    await expect(isolatedFrame).toBeVisible({ timeout: 10000 });

    // Wait for iframe to be ready
    await waitForIframeContent(
      page,
      "document.querySelector('[data-widget-type=\"Output\"]') ? 'ready' : 'not ready'",
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
