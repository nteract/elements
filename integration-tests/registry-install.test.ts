/**
 * Integration test for nteract-elements shadcn registry
 *
 * This test verifies that all registry components can be installed
 * into a fresh Next.js project and build successfully.
 *
 * Run: pnpm test:integration
 */

import { execSync, spawn, type ChildProcess } from "node:child_process";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import handler from "serve-handler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, "..");

interface TestResult {
  step: string;
  success: boolean;
  duration: number;
  error?: string;
}

function log(message: string) {
  console.log(`\n${"=".repeat(60)}\n${message}\n${"=".repeat(60)}`);
}

function logStep(step: number, message: string) {
  console.log(`\n[Step ${step}] ${message}`);
}

async function startRegistryServer(): Promise<{
  server: Server;
  port: number;
}> {
  return new Promise((resolve, reject) => {
    const publicDir = join(PROJECT_ROOT, "public");
    const server = createServer((req, res) => {
      // Log each request to see what shadcn is fetching
      console.log(`  [registry] ${req.method} ${req.url}`);
      return handler(req, res, { public: publicDir });
    });

    // Use port 0 to let the OS assign an available port
    server.listen(0, () => {
      const address = server.address();
      const port =
        typeof address === "object" && address !== null ? address.port : 0;
      console.log(`  Registry server running at http://localhost:${port}`);
      console.log(`  Serving: ${publicDir}`);
      resolve({ server, port });
    });

    server.on("error", (err) => {
      reject(new Error(`Failed to start registry server: ${err.message}`));
    });
  });
}

function configureRegistry(appDir: string, port: number) {
  const componentsJsonPath = join(appDir, "components.json");
  const config = JSON.parse(readFileSync(componentsJsonPath, "utf-8"));

  config.registries = {
    "@nteract": {
      url: `http://localhost:${port}/r/{name}.json`,
    },
  };

  writeFileSync(componentsJsonPath, JSON.stringify(config, null, 2));
  console.log(
    `  Updated components.json with local registry URL (port ${port})`,
  );
}

function runCommand(
  command: string,
  cwd: string,
  _description: string,
): { success: boolean; duration: number; error?: string } {
  const start = Date.now();
  try {
    execSync(command, {
      cwd,
      // Use 'pipe' for stdin to avoid hanging on prompts, inherit stdout/stderr
      stdio: ["pipe", "inherit", "inherit"],
      env: {
        ...process.env,
        // Disable interactive prompts and colors/spinners
        CI: "true",
        NO_COLOR: "1",
        FORCE_COLOR: "0",
      },
    });
    return { success: true, duration: Date.now() - start };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { success: false, duration: Date.now() - start, error };
  }
}

async function main() {
  const results: TestResult[] = [];
  let tempDir: string | null = null;
  let server: Server | null = null;
  let registryPort = 0;

  log("nteract-elements Registry Integration Test");
  console.log(`Project root: ${PROJECT_ROOT}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  try {
    // Step 1: Build the registry
    logStep(1, "Building registry...");
    const buildResult = runCommand(
      "pnpm run registry:build",
      PROJECT_ROOT,
      "Build registry",
    );
    results.push({ step: "build-registry", ...buildResult });
    if (!buildResult.success) {
      throw new Error(`Registry build failed: ${buildResult.error}`);
    }

    // Step 2: Copy registry.json to public/r/
    logStep(2, "Copying registry to public/r/...");
    const copyStart = Date.now();
    execSync("mkdir -p public/r && cp registry.json public/r/registry.json", {
      cwd: PROJECT_ROOT,
      stdio: "inherit",
    });
    results.push({
      step: "copy-registry",
      success: true,
      duration: Date.now() - copyStart,
    });

    // Step 3: Start local registry server
    logStep(3, "Starting local registry server...");
    const serverResult = await startRegistryServer();
    server = serverResult.server;
    registryPort = serverResult.port;
    results.push({ step: "start-server", success: true, duration: 0 });

    // Step 4: Create temp directory
    logStep(4, "Creating temp directory...");
    tempDir = mkdtempSync(join(tmpdir(), "nteract-registry-test-"));
    console.log(`  Temp directory: ${tempDir}`);
    results.push({ step: "create-temp-dir", success: true, duration: 0 });

    // Step 5: Create Next.js project
    logStep(5, "Creating Next.js project (this may take a few minutes)...");
    const createResult = runCommand(
      `npx --yes create-next-app@latest test-app --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes`,
      tempDir,
      "Create Next.js project",
    );
    results.push({ step: "create-nextjs", ...createResult });
    if (!createResult.success) {
      throw new Error(
        `Failed to create Next.js project: ${createResult.error}`,
      );
    }

    const appDir = join(tempDir, "test-app");

    // Step 6: Initialize shadcn
    logStep(6, "Initializing shadcn...");
    const initResult = runCommand(
      "pnpm dlx shadcn@latest init -y -d",
      appDir,
      "Initialize shadcn",
    );
    results.push({ step: "init-shadcn", ...initResult });
    if (!initResult.success) {
      throw new Error(`Failed to initialize shadcn: ${initResult.error}`);
    }

    // Step 7: Configure local registry
    logStep(7, "Configuring local registry...");
    configureRegistry(appDir, registryPort);
    results.push({ step: "configure-registry", success: true, duration: 0 });

    // Step 8: Install all nteract components
    logStep(
      8,
      "Installing @nteract/all components (this may take a few minutes)...",
    );
    const installResult = runCommand(
      "pnpm dlx shadcn@latest add @nteract/all -yo --verbose",
      appDir,
      "Install nteract components",
    );
    results.push({ step: "install-components", ...installResult });
    if (!installResult.success) {
      throw new Error(
        `Failed to install nteract components: ${installResult.error}`,
      );
    }

    // Step 9: Run next build
    logStep(9, "Running next build (this may take a few minutes)...");
    const nextBuildResult = runCommand(
      "npm run build",
      appDir,
      "Next.js build",
    );
    results.push({ step: "next-build", ...nextBuildResult });
    if (!nextBuildResult.success) {
      throw new Error(`Next.js build failed: ${nextBuildResult.error}`);
    }

    // Success!
    log("ALL TESTS PASSED");
    printResults(results);
    process.exit(0);
  } catch (err) {
    log("TEST FAILED");
    console.error(err instanceof Error ? err.message : String(err));
    printResults(results);
    process.exit(1);
  } finally {
    // Cleanup
    if (server) {
      console.log("\nStopping registry server...");
      server.close();
    }
    if (tempDir && existsSync(tempDir)) {
      console.log(`Cleaning up temp directory: ${tempDir}`);
      rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

function printResults(results: TestResult[]) {
  console.log("\n" + "=".repeat(60));
  console.log("Test Results Summary");
  console.log("=".repeat(60));

  let totalDuration = 0;
  for (const result of results) {
    const status = result.success ? "PASS" : "FAIL";
    const duration =
      result.duration > 0 ? ` (${(result.duration / 1000).toFixed(1)}s)` : "";
    const icon = result.success ? "\u2714" : "\u2718";
    console.log(`  ${icon} ${status}: ${result.step}${duration}`);
    totalDuration += result.duration;
  }

  console.log("-".repeat(60));
  console.log(`  Total time: ${(totalDuration / 1000).toFixed(1)}s`);
  console.log("=".repeat(60));
}

main();
