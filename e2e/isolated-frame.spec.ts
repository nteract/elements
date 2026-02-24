import { expect, type Page, test } from "@playwright/test";

/**
 * Execute code inside the isolated iframe via postMessage eval channel.
 * Adapted from runt's iframe-isolation.spec.js pattern for Playwright.
 *
 * The IsolatedFrame uses a sandboxed iframe without allow-same-origin,
 * so we cannot access iframe.contentDocument directly. Instead, we use
 * the production postMessage eval channel (frame-html.ts handles { type: "eval" }).
 */
/**
 * Wait for content to appear inside the iframe by polling with evalInIframe.
 * More reliable than waitForTimeout since it waits for actual content.
 */
async function waitForIframeContent(
  page: Page,
  checkCode: string,
  expectedValue: string | RegExp,
  selector = "[data-slot='isolated-frame']",
  timeout = 10000,
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const result = await evalInIframe(page, checkCode, selector, 2000);
    if (result.success && result.result) {
      if (typeof expectedValue === "string") {
        if (result.result.includes(expectedValue)) return;
      } else {
        if (expectedValue.test(result.result)) return;
      }
    }
    await page.waitForTimeout(50); // Small poll interval
  }
  throw new Error(
    `Timeout waiting for iframe content matching ${expectedValue}`,
  );
}

async function evalInIframe(
  page: Page,
  code: string,
  selector = "[data-slot='isolated-frame']",
  timeout = 10000,
): Promise<{ success: boolean; result?: string; error?: string }> {
  // Step 1: Set up listener in parent and send eval message to iframe
  await page.evaluate(
    ({ code, selector }) => {
      (window as unknown as Record<string, unknown>).__iframeEvalResult =
        undefined;
      (window as unknown as Record<string, unknown>).__iframeEvalDone = false;

      window.addEventListener("message", function handler(event) {
        if (event.data?.type === "eval_result") {
          (window as unknown as Record<string, unknown>).__iframeEvalResult =
            event.data.payload;
          (window as unknown as Record<string, unknown>).__iframeEvalDone =
            true;
          window.removeEventListener("message", handler);
        }
      });

      const iframe = document.querySelector(selector) as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: "eval", payload: { code } },
          "*",
        );
      } else {
        (window as unknown as Record<string, unknown>).__iframeEvalResult = {
          success: false,
          error: "iframe not found",
        };
        (window as unknown as Record<string, unknown>).__iframeEvalDone = true;
      }
    },
    { code, selector },
  );

  // Step 2: Wait for result
  await page.waitForFunction(
    () =>
      (window as unknown as Record<string, unknown>).__iframeEvalDone === true,
    { timeout },
  );

  // Step 3: Retrieve and clean up result
  const result = await page.evaluate(() => {
    const r = (window as unknown as Record<string, unknown>).__iframeEvalResult;
    delete (window as unknown as Record<string, unknown>).__iframeEvalResult;
    delete (window as unknown as Record<string, unknown>).__iframeEvalDone;
    return r as { success: boolean; result?: string; error?: string };
  });

  return result;
}

test.describe("IsolatedFrame Security", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs/outputs/isolated-frame");
    // Wait for the first iframe to be ready
    await page.waitForSelector("[data-slot='isolated-frame']", {
      timeout: 15000,
    });
  });

  test("iframe has correct sandbox attributes", async ({ page }) => {
    const iframe = page.locator("[data-slot='isolated-frame']").first();
    const sandbox = await iframe.getAttribute("sandbox");

    // Critical: allow-same-origin must NOT be present
    expect(sandbox).not.toContain("allow-same-origin");
    // allow-scripts is required for interactive content
    expect(sandbox).toContain("allow-scripts");
  });

  test("iframe has opaque null origin", async ({ page }) => {
    const result = await evalInIframe(
      page,
      "window.origin || window.location.origin",
    );
    expect(result.success).toBe(true);
    expect(result.result).toBe("null");
  });

  test("iframe cannot access parent document", async ({ page }) => {
    const result = await evalInIframe(
      page,
      "try { window.parent.document.body; 'accessible' } catch(e) { 'blocked:' + e.name }",
    );
    expect(result.success).toBe(true);
    expect(result.result).toContain("blocked");
  });

  test("iframe cannot access localStorage", async ({ page }) => {
    const result = await evalInIframe(
      page,
      "try { window.localStorage.getItem('test'); 'accessible' } catch(e) { 'blocked:' + e.name }",
    );
    expect(result.success).toBe(true);
    expect(result.result).toContain("blocked");
  });
});

test.describe("HTML Editor Demo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs/outputs/isolated-frame");
    // Wait for the HTML editor demo to load
    await page.waitForSelector("[data-slot='html-editor-demo']", {
      timeout: 15000,
    });
  });

  test("demo has required data-slot attributes", async ({ page }) => {
    await expect(page.locator("[data-slot='html-editor-demo']")).toBeVisible();
    await expect(page.locator("[data-slot='html-editor-input']")).toBeVisible();
    await expect(
      page.locator("[data-slot='html-editor-preview']"),
    ).toBeVisible();
  });

  test("iframe renders initial HTML content", async ({ page }) => {
    // Find the iframe inside the HTML editor preview
    const previewIframe = page
      .locator("[data-slot='html-editor-preview'] [data-slot='isolated-frame']")
      .first();
    await expect(previewIframe).toBeVisible();

    // Wait for content to appear in iframe (polls until h1 contains expected text)
    await waitForIframeContent(
      page,
      "document.querySelector('h1')?.textContent || 'not found'",
      "Hello from IsolatedFrame",
      "[data-slot='html-editor-preview'] [data-slot='isolated-frame']",
    );

    // Verify the content
    const result = await evalInIframe(
      page,
      "document.querySelector('h1')?.textContent || 'not found'",
      "[data-slot='html-editor-preview'] [data-slot='isolated-frame']",
    );

    expect(result.success).toBe(true);
    expect(result.result).toContain("Hello from IsolatedFrame");
  });

  test("editing code updates the iframe preview", async ({ page }) => {
    // Find the CodeMirror editor inside the HTML editor
    const editor = page.locator(
      "[data-slot='html-editor-input'] .cm-editor .cm-content",
    );
    await expect(editor).toBeVisible();

    // Wait for initial content to render before editing
    await waitForIframeContent(
      page,
      "document.querySelector('h1')?.textContent || 'not found'",
      "Hello from IsolatedFrame",
      "[data-slot='html-editor-preview'] [data-slot='isolated-frame']",
    );

    // Focus and select all content (ControlOrMeta works on both Mac and Linux)
    await editor.click();
    await page.keyboard.press("ControlOrMeta+a");
    // Type new HTML
    await page.keyboard.type(
      '<div id="test-update">Updated via e2e test</div>',
    );

    // Wait for iframe to update with new content (polls until element appears)
    await waitForIframeContent(
      page,
      "document.querySelector('#test-update')?.textContent || 'not found'",
      "Updated via e2e test",
      "[data-slot='html-editor-preview'] [data-slot='isolated-frame']",
    );

    // Verify the iframe was updated
    const result = await evalInIframe(
      page,
      "document.querySelector('#test-update')?.textContent || 'not found'",
      "[data-slot='html-editor-preview'] [data-slot='isolated-frame']",
    );

    expect(result.success).toBe(true);
    expect(result.result).toBe("Updated via e2e test");
  });

  test("interactive button works inside iframe", async ({ page }) => {
    // Wait for initial content to render (button should exist)
    await waitForIframeContent(
      page,
      "document.querySelector('.counter')?.textContent || 'not found'",
      "Click me",
      "[data-slot='html-editor-preview'] [data-slot='isolated-frame']",
    );

    // The default demo has a click counter button
    // Click the button via evalInIframe
    await evalInIframe(
      page,
      "document.querySelector('.counter')?.click()",
      "[data-slot='html-editor-preview'] [data-slot='isolated-frame']",
    );

    // Wait for button text to update (polls until "Clicked" appears)
    await waitForIframeContent(
      page,
      "document.querySelector('.counter')?.textContent || 'not found'",
      "Clicked",
      "[data-slot='html-editor-preview'] [data-slot='isolated-frame']",
    );

    // Verify the button text was updated
    const result = await evalInIframe(
      page,
      "document.querySelector('.counter')?.textContent || 'not found'",
      "[data-slot='html-editor-preview'] [data-slot='isolated-frame']",
    );

    expect(result.success).toBe(true);
    expect(result.result).toContain("Clicked");
  });
});
