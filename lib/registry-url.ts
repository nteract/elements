/**
 * Registry URL helpers for the nteract elements registry.
 *
 * Uses Vercel environment variables at build time to determine the correct
 * domain for registry URLs. This ensures preview deployments get the correct
 * URLs for their branch.
 */

/**
 * Get the base URL for the registry.
 *
 * Priority:
 * 1. VERCEL_URL (available at build time on Vercel)
 * 2. localhost:3000 for development
 * 3. Production fallback
 */
export function getRegistryBaseUrl(): string {
  // VERCEL_URL is available at build time and runtime on Vercel
  // It does NOT include the protocol
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback for local development
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Production fallback
  return "https://nteract-elements.vercel.app";
}

/**
 * Get the full registry URL for a component.
 *
 * @param component - The component name (e.g., "button", "play-button")
 * @returns The full URL to the component's registry JSON
 *
 * @example
 * getRegistryUrl("button")
 * // => "https://nteract-elements.vercel.app/r/button.json"
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
