import { getRegistryUrl } from "@/lib/registry-url";

interface InstallCommandProps {
  /** The component name (e.g., "button", "play-button") */
  component: string;
}

/**
 * Renders a shadcn CLI install command with the correct registry URL.
 * Works on both preview and production deployments by using Vercel's
 * VERCEL_URL environment variable at build time.
 *
 * @example
 * <InstallCommand component="button" />
 * // Renders: npx shadcn@latest add https://nteract-elements.vercel.app/r/button.json
 */
export function InstallCommand({ component }: InstallCommandProps) {
  const url = getRegistryUrl(component);

  return (
    <div className="not-prose">
      <pre className="overflow-x-auto rounded-lg border bg-zinc-950 p-4 dark:bg-zinc-900">
        <code className="text-sm text-zinc-50">{`npx shadcn@latest add ${url}`}</code>
      </pre>
    </div>
  );
}
