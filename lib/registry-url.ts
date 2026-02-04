/**
 * Registry URL helpers for the nteract elements registry.
 *
 * Uses Vercel environment variables at build time to determine the correct
 * domain for registry URLs. This ensures preview deployments get the correct
 * URLs for their branch, while production uses the canonical domain.
 *
 * Environment variables used:
 * - VERCEL_ENV: "production" | "preview" | "development"
 * - VERCEL_URL: The deployment URL (without protocol)
 */

const PRODUCTION_URL = "https://nteract-elements.vercel.app";

/**
 * Get the base URL for the registry.
 *
 * Priority:
 * 1. Production environment → use canonical production URL
 * 2. Preview environment → use VERCEL_URL for the preview deployment
 * 3. Development → localhost:3000
 * 4. Fallback → production URL
 */
export function getRegistryBaseUrl(): string {
  const vercelEnv = process.env.VERCEL_ENV;

  // Production always uses the canonical URL
  if (vercelEnv === "production") {
    return PRODUCTION_URL;
  }

  // Preview deployments use their unique URL
  if (vercelEnv === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Fallback to production
  return PRODUCTION_URL;
}

/**
 * Get the full registry URL for a component.
 *
 * @param component - The component name (e.g., "button", "play-button")
 * @returns The full URL to the component's registry JSON
 *
 * @example
 * getRegistryUrl("button")
 * // Production: "https://nteract-elements.vercel.app/r/button.json"
 * // Preview: "https://nteract-elements-git-feature-nteract.vercel.app/r/button.json"
 */
export function getRegistryUrl(component: string): string {
  return `${getRegistryBaseUrl()}/r/${component}.json`;
}

/**
 * Get the shadcn CLI install command for a component.
 *
 * @param component - The component name (e.g., "button", "play-button")
 * @returns The full npx command to install the component
 *
 * @example
 * getInstallCommand("button")
 * // => "npx shadcn@latest add https://nteract-elements.vercel.app/r/button.json"
 */
export function getInstallCommand(component: string): string {
  return `npx shadcn@latest add ${getRegistryUrl(component)}`;
}
